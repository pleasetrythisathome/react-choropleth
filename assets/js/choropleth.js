var Choropleth = {};

Choropleth.Main = React.createClass({
  render: function() {
    var div = React.DOM.div;

    return div({
      className: "choropleth_main"
    },
              "Hello Choropleth!");
  }
});

React.renderComponent(Choropleth.Main(), document.getElementById("main"));
