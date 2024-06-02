class BarChart {
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

        this.x.domain(monthData.map(d => d.month));
        this.y.domain([0, d3.max(monthData, d => d.count)]);

        this.xAxisGroup.transition().duration(750).call(d3.axisBottom(this.x));
        this.yAxisGroup.transition().duration(750).call(d3.axisLeft(this.y));

        const bars = this.chartGroup.selectAll(".bar")
            .data(monthData);

        bars.enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => this.x(d.month))
            .attr("width", this.x.bandwidth())
            .attr("y", this.chartHeight)
            .attr("height", 0)
            .merge(bars)
            .transition().duration(750)
            .attr("x", d => this.x(d.month))
            .attr("y", d => this.y(d.count))
            .attr("height", d => this.chartHeight - this.y(d.count))
            .attr("fill", "#69b3a2");

        bars.exit().remove();
    }
}