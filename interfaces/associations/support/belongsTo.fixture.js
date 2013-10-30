/**
 * Dependencies
 */

var Waterline = require('waterline');

module.exports = Waterline.Collection.extend({

  identity: 'payment',
  adapter: 'test',

  attributes: {
    amount: 'integer',
    type: 'string',
    customer: {
      model: 'Customer'
    },

    toJSON: function() {
      var obj = this.toObject();
      delete obj.type;
      return obj;
    }
  }

});
