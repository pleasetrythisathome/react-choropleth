var Choropleth = {};

Choropleth.Map = React.createClass({
  getDefaultProps: function() {
    return {
      width: 960,
      height: 500
    };
  },

  rateById: d3.map(),
  path: d3.geo.path(),
  quantize: d3.scale.quantize()
    .domain([0, 0.15])
    .range(d3.range(9).map(function(i) {
      return "q" + i + "-9";
    })),

  getInitialState: function() {
    return {
      counties: [],
      states: {}
    };
  },

  componentWillMount: function() {
    var cmp = this;

    queue()
      .defer(d3.json, "/assets/data/us.json")
      .defer(d3.tsv, "/assets/data/unemployment.tsv", function(d) {
        cmp.rateById.set(d.id, +d.rate);
      })
      .await(function(error, us) {
        cmp.setState({
          counties: topojson.feature(us, us.objects.counties).features,
          states: topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; })
        });
      });
  },

  renderCounties: function() {
    if (_.isEmpty(this.state.counties)) return;

    var g = React.DOM.g;

    return g({
      className: "counties"
    },
             _.map(this.state.counties, this.createCounty));
  },
  createCounty: function(county) {
    return Choropleth.County({
      addClass: this.quantize(this.rateById.get(county.id)),
      path: this.path(county)
    });
  },
  renderStates: function() {
    if (_.isEmpty(this.state.states)) return;

    var path = React.DOM.path;

    return path({
      className: "states",
      d: this.path(this.state.states)
    });
  },

  render: function() {
    var cmp = this;

    var svg = React.DOM.svg;
    var g = React.DOM.g;
    var path = React.DOM.path;

    return svg({
      className: "choropleth Blues",
      width: this.props.width,
      height: this.props.height
    },
              this.renderCounties(),
              this.renderStates());
  }
});

Choropleth.County = React.createClass({
  getDefaultProps: function() {
    return {
      addClass: ""
    };
  },
  render: function() {
    var path = React.DOM.path;

    return path({
      className: "county " + this.props.addClass,
      d: this.props.path
    });
  }
});

React.renderComponent(Choropleth.Map(), document.getElementById("main"));
