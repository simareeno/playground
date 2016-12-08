requirejs.config({
  paths: {
    'tracking': 'https://ru.4game.com/packages/4game-api-client/out/track4game.min'
  }
});

requirejs(['tracking', 'jquery', 'packages/4game-api-client'], function(track4game, $, api) {


  $(document).ready(function() {
    $('.bGamePageSearch .bUIInput__eControl').bind('change keyup input click', function() {
      if (this.value.match(/[^a-zA-Zа-яА-Я0-9 ]/g)) {
        this.value = this.value.replace(/[^a-zA-Zа-яА-Я0-9 ]/g, '');
      }
      if (this.value.length > 200) {
        this.value = this.value.substr(0, 200);
      }
    });

    $('.bGamePageSearch').on('submit', function(e) {
      var $form = $(this);
      var value = $form.find('.bUIInput__eControl').val();
      var action = $form.attr('data-action');

      $form.attr('action', action + value);
      api.track('aion-knowledge-base-search', {
        'query': action + value,
      });
    });

  });

});
