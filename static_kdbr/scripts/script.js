(function ($) {

    //Script for gp-panel with rows:
    $('.ac-list-row-union .extrow').toggle(
        function(){
            var inHeight=$(this).parents('.jspPane').height();

            $(this).addClass('js-open-ac-list-extrow')
                .nextAll().each(
                function(){
                    if($(this).hasClass('ac-list-row-union')){
                        $('.extrow',this).slideDown();
                    }
                }
            ).slideDown('',
                function(){
                    inHeight=inHeight+$(this).height();

                    if(inHeight>$(this).parents('.general-panel-content').height()){
                        $(this).parents('.scroll-pane').jScrollPane();
                    };
                }
            );

        },
        function(){
            var inHeight=$(this).parents('.jspPane').height();

            $(this).removeClass('js-open-ac-list-extrow')
                .nextAll().slideUp('',
                function(){
                    inHeight=inHeight+$(this).height();
                    if(inHeight>$(this).closest('.general-panel-content').height()){
                        $(this).closest('.scroll-pane').jScrollPane();
                    };
                }
            );
        }
    );


    //For custom select:
    $('.customSelect').change(function(){
        $(this).next().children('.gp-tbr-slyledselect-text')
            .text(this.options[this.selectedIndex].text);
    });

    //For scroll:
    if($('.gp-list-your-planets-content').height()<($('.gp-list-your-planets-content .gp-blackbg-create-new-proj').length*$('.gp-list-your-planets-content .gp-blackbg-create-new-proj').height())){
//        $('.gp-list-your-planets-content').addClass('scroll-pane');
    }

    $('.scroll-pane').jScrollPane({
        addToWidth: 37
    });
    $('.scroll-pane-large').jScrollPane({
        addToWidth: 59
    });


    $('.extend-elem').click(function(e) {
        var $elem = $(e.currentTarget);
        $('#target-' + $elem.data('id')).slideToggle(200);
    });

    



})(jQuery);


