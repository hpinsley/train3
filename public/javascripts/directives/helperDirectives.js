angular.module('train')
    .directive('hpFocus', function () {
        return {
            restrict:    'A',
            link: function(scope, iElement, iAttrs) {
                var watchItem = iAttrs.hpFocus;

                scope.$watch(watchItem, function(newVal, oldVal){
                    if (newVal === true) {
                        setTimeout(function(){
                            iElement[0].focus();
                            scope[watchItem] = false;
                        }, 0);
                    }
                });

            }
        };
    });
