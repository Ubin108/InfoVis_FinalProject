class PieChart {
    constructor(svg, width = 200, height = 200) {
        this.svg = d3.select(svg);
        this.width = width;
        this.height = height;
        this.radius = Math.min(this.width, this.height) / 2;

        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.arc = d3.arc()
            .outerRadius(this.radius - 10)
            .innerRadius(0);

        this.labelArc = d3.arc()
            .outerRadius(this.radius - 40)
            .innerRadius(this.radius - 40);

        this.pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        this.svg
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);
    }

    initialize(data) {
        const g = this.svg.select("g");

        const path = g.selectAll(".arc")
            .data(this.pie(data))
            .enter().append("g")
            .attr("class", "arc");

        path.append("path")
            .attr("d", this.arc)
            .style("fill", d => this.color(d.data.name));

        path.append("text")
            .attr("transform", d => `translate(${this.labelArc.centroid(d)})`)
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(d => d.data.name);
    }

    update(data) {
        const g = this.svg.select("g");
        
        g.selectAll(".arc").remove();

        const path = g.selectAll(".arc")
            .data(this.pie(data))
            .enter().append("g")
            .attr("class", "arc");

        path.append("path")
            .attr("d", this.arc)
            .style("fill", d => this.color(d.data.name));

        path.append("text")
            .attr("transform", d => `translate(${this.labelArc.centroid(d)})`)
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .text(d => d.data.name);
    }
}
