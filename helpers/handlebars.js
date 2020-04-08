function handlebarsHelpers(hbs) {
    return hbs.create({
        helpers: {
            isEqual: function (value1, value2, options) {
                if (value1 === value2) {
                    return options.fn(this);
                }
                return options.inverse(this);
            }
        }
    });
}

module.exports = handlebarsHelpers;