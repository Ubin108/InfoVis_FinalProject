class Treemap {
    margin = { top: 40, right: 10, bottom: 10, left: 10 };

    constructor(svg, data, width = 1200, height = 570) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;

        this.colorScale = d3.scaleOrdinal()
            .domain(data.children.map(d => d.name))
            .range(d3.schemeTableau10);

        this.legendLabels = {
            "AF": "Africa",
            "NAM": "North America",
            "SAM": "South America",
            "OC": "Oceania",
            "AS": "Asia",
            "EU": "Europe"
        };

        this.handlers = {};
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");

        this.treemap = d3.treemap()
            .size([this.width, this.height])
            .padding(1)
            .round(true);

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);
        
        this.addLegend();
        this.processData();
        this.update();
    }

    addLegend() {
        const legend = this.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top - 30})`);

        let xOffset = 0;

        const legendItem = legend.selectAll(".legend-item")
            .data(this.colorScale.domain())
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => {
                const transform = `translate(${xOffset}, 0)`;
                xOffset += this.getLegendItemWidth(d) + 100;
                return transform;
            });

        legendItem.append("rect")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", this.colorScale);

        legendItem.append("text")
            .attr("x", 25)
            .attr("y", 10)
            .attr("dy", "0.35em")
            .text(d => `${d} (${this.legendLabels[d]})`);
    }

    getLegendItemWidth(d) {
        const text = `${d} (${this.legendLabels[d]})`;
        const tempSvg = d3.select("body").append("svg");
        const tempText = tempSvg.append("text").text(text).style("font", "10px sans-serif");
        const width = tempText.node().getComputedTextLength();
        tempSvg.remove();
        return width;
    }


    processData() {
        this.root = d3.hierarchy(this.data)
            .sum(d => d.value)
            .sort((a, b) => {
                if (a.depth === 1 && b.depth === 1) {
                    return a.data.id - b.data.id;
                } else if (a.depth === 2 && b.depth === 2 && a.parent.data.id === b.parent.data.id) {
                    return b.value - a.value;
                }
                return 0;
            });

        this.treemap(this.root);
    }

    update() {
        const uid = (name) => name.replace(/\s+/g, '-').toLowerCase();

        this.nodes = this.container.selectAll(".node")
            .data(this.root.leaves())
            .join("g")
            .attr("class", "node")
            .attr("transform", d => `translate(${d.x0},${d.y0})`);

        this.nodes.append("rect")
            .attr("id", d => `leaf-${uid(d.data.name)}`)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => this.getCountryColor(d));

        this.nodes.append("clipPath")
            .attr("id", d => `clip-${uid(d.data.name)}`)
            .append("use")
            .attr("xlink:href", d => `#leaf-${uid(d.data.name)}`);

        this.nodes.append("text")
            .attr("clip-path", d => `url(#clip-${uid(d.data.name)})`)
            .attr("x", d => (d.x1 - d.x0) / 2)
            .attr("y", d => (d.y1 - d.y0) / 2)
            .attr("text-anchor", "middle")
            .style("font-size", d => Math.min((d.x1 - d.x0) / 5, (d.y1 - d.y0) / 3))
            .text(d => d.data.name);

        this.nodes.append("title")
            .text(d => `${d.data.name}: ${d.value}`);

        const parents = this.container.selectAll(".parent")
            .data(this.root.descendants().filter(d => d.depth === 1))
            .join("g")
            .attr("class", "parent");

        parents.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", "none");
    }

    getCountryColor(d) {
        let ancestor = d;
        while (ancestor.depth > 1) ancestor = ancestor.parent;
        return this.colorScale(ancestor.data.name);
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}
