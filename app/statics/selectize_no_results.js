/*
    https://github.com/brianreavis/selectize.js/issues/470
    Selectize doesn't display anything to let the user know there are no results.
    This is a temporary patch to display a no results option when there are no
    options to select for the user.
*/

Selectize.define( 'no_match', function( options ) {
    var self = this;

    self.onNotMatch = function () {
        self.settings.noMatch();
    };
    
    self.refreshOptions = (function () {
        var original = self.refreshOptions;
        return function () {
            original.apply( self, arguments );

            if(!this.hasOptions && this.$control_input.val() != ''){
                this.onNotMatch();
            }
        }
    })();
});