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

  renderStates: function() {
    var path = React.DOM.path;

    return path({
      className: states,
      d: this.props.path(states)
    });
  },
  render: function() {
    var cmp = this;

    var svg = React.DOM.svg;
    var g = React.DOM.g;
    var path = React.DOM.path;

    var counties;
    if (!_.isEmpty(this.state.counties)) {
      counties = g({
        className: "counties"
      },
                  _.map(this.state.counties, function(county) {
                    return path({
                      className: cmp.quantize(cmp.rateById.get(county.id)),
                      d: cmp.path(county)
                    });
                  }));
    }

    var states;
    if (!_.isEmpty(this.state.states)) {
      states = path({
        className: "states",
        d: this.path(this.state.states)
      });
    }


    return svg({
      className: "choropleth Blues",
      width: this.props.width,
      height: this.props.height
    },
              counties,
              states);
  }
});

React.renderComponent(Choropleth.Map(), document.getElementById("main"));
