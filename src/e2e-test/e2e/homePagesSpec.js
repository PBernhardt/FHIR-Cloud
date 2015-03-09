describe('Home Pages', function() {

  var ptor = protractor.getInstance();

  it('should load the homepage', function() {
    ptor.get('/#home');
    expect(ptor.findElement(protractor.By.id('view-container')).getText()).toBe('Welcome Home...');
  });

});
