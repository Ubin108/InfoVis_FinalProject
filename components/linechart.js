class LineChart {
    constructor(svg, width = 400, height = 300) {
        this.svg = d3.select(svg);
        this.width = width;
        this.height = height;
        this.margin = { top: 20, right: 30, bottom: 30, left: 40 };

        this.chartWidth = this.width - this.margin.left - this.margin.right;
        this.chartHeight = this.height - this.margin.top - this.margin.bottom;

        this.x = d3.scaleBand().range([0, this.chartWidth]).padding(0.1);
        this.y = d3.scaleLinear().range([this.chartHeight, 0]);

        this.chartGroup = this.svg
            .attr("width", this.width)
            .attr("height", this.height)
            .append("g")
            .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

        this.xAxisGroup = this.chartGroup.append("g")
            .attr("transform", `translate(0, ${this.chartHeight})`);

        this.yAxisGroup = this.chartGroup.append("g");

        this.line = d3.line()
            .x(d => this.x(d.month) + this.x.bandwidth() / 2)
            .y(d => this.y(d.count));

        this.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
    }

    initialize(data) {
        this.update(data);
    }

    update(data) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthData = months.map((month, i) => {
            const count = data.filter(d => new Date(d['Departure Date']).getMonth() === i).length;
            return { month, count };
        });

        const yMin = d3.min(monthData, d => d.count);
        const yMax = d3.max(monthData, d => d.count);

        this.x.domain(monthData.map(d => d.month));
        this.y.domain([yMin - 50, yMax + 50]);

        this.xAxisGroup.transition().duration(750).call(d3.axisBottom(this.x));
        this.yAxisGroup.transition().duration(750).call(d3.axisLeft(this.y));

        const linePath = this.chartGroup.selectAll(".line")
            .data([monthData]);

        linePath.enter().append("path")
            .attr("class", "line")
            .attr("d", this.line)
            .attr("fill", "none")
            .attr("stroke", "#69b3a2")
            .attr("stroke-width", 2)
            .merge(linePath)
            .transition().duration(750)
            .attr("d", this.line);

        linePath.exit().remove();

        const points = this.chartGroup.selectAll(".point")
            .data(monthData);

        points.enter().append("circle")
            .attr("class", "point")
            .attr("cx", d => this.x(d.month) + this.x.bandwidth() / 2)
            .attr("cy", d => this.y(d.count))
            .attr("r", 5)
            .attr("fill", "#69b3a2")
            .on("mouseover", (event, d) => {
                this.tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                this.tooltip.html(`${d.month}: ${d.count}`)
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                this.tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .merge(points)
            .transition().duration(750)
            .attr("cx", d => this.x(d.month) + this.x.bandwidth() / 2)
            .attr("cy", d => this.y(d.count));

        points.exit().remove();
    }
}
