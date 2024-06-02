class PieChart {
    constructor(svg, width = 200, height = 200) {
        this.svg = d3.select(svg);
        this.width = width;
        this.height = height;
        this.outerRadius = Math.min(this.width, this.height) / 2 - 10;
        this.innerRadius = this.outerRadius * 0.75;

        this.color = d3.scaleOrdinal(d3.schemeCategory10);

        this.arc = d3.arc()
            .innerRadius(this.innerRadius)
            .outerRadius(this.outerRadius);

        this.pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        this.chartGroup = this.svg
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.width / 2}, ${this.height / 2})`);

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    initialize(data) {
        this.update(data);
    }

    update(data) {
        const total = d3.sum(data, d => d.value);
        const pieData = this.pie(data);

        const path = this.chartGroup.selectAll("path")
            .data(pieData);

        path.exit().remove();

        path.enter().append("path")
            .attr("fill", (d, i) => this.color(i))
            .attr("d", this.arc)
            .each(function(d) { this._current = d; })
            .on("mouseover", (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                this.tooltip.html(`${d.data.name}: ${d.data.value}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                this.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        path.transition().duration(750).attrTween("d", function(a) {
            const interpolate = d3.interpolate(this._current, a);
            this._current = interpolate(0);
            return function(t) {
                return this.arc(interpolate(t));
            }.bind(this);
        }.bind(this));

        path.merge(path);

        const text = this.chartGroup.selectAll("text.percent")
            .data(pieData);

        text.enter().append("text")
            .attr("class", "percent")
            .attr("dy", ".35em")
            .attr("font-size", "12px")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${this.arc.centroid(d)})`)
            .text(d => `${Math.round((d.data.value / total) * 100)}%`)
            .merge(text)
            .transition().duration(750)
            .attr("transform", d => `translate(${this.arc.centroid(d)})`)
            .text(d => `${Math.round((d.data.value / total) * 100)}%`);

        text.exit().remove();

        this.chartGroup.selectAll(".legend-item").remove();
        const legendGroup = this.chartGroup.append("g")
            .attr("class", "legend-item")
            .attr("transform", `translate(0, 0)`);

        const legend = legendGroup.selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20 - (data.length - 1) * 10})`);

        legend.append("rect")
            .attr("x", -30)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", (d, i) => this.color(i));

        legend.append("text")
            .attr("x", -15)
            .attr("dy", "0.75em")
            .attr("font-size", "10px")
            .attr("text-anchor", "start")
            .text(d => `${d.name}`);
    }

    change(value) {
        this.pie.value(d => d[value]);
        const pieData = this.pie(this.chartGroup.data());

        const path = this.chartGroup.selectAll("path").data(pieData);

        path.transition().duration(750).attrTween("d", function(a) {
            const interpolate = d3.interpolate(this._current, a);
            this._current = interpolate(0);
            return function(t) {
                return this.arc(interpolate(t));
            }.bind(this);
        }.bind(this));
    }
}
