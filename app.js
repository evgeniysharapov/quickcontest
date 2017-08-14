/* globals: Handlebars, $, firebase */

const appConfig  = {
  appTitle: "CookOff"
};

const entries = {
};
// initial showing
// document.getElementById('single-entry').className="hidden";
// document.getElementById('all-entries').className="active";

function configuration ( cfg ) {
  const title = document.getElementById('appTitle');
  title.innerText = cfg.appTitle;
};

// ==== Add contestant Entry Dialog
const addDialog = new mdc.dialog.MDCDialog(document.querySelector('#add-entry'));

addDialog.listen('MDCDialog:accept', function() {
  console.log('accepted');
});

addDialog.listen('MDCDialog:cancel', function() {
  console.log('canceled');
});

document.querySelector('#addEntry').addEventListener('click', function (evt) {
  addDialog.lastFocusedTarget = evt.target;
  addDialog.show();
});



// ==== Judgement dialog
const entryDialog = new mdc.dialog.MDCDialog(document.querySelector('#single-entry'));

entryDialog.listen('MDCDialog:accept', function() {
  console.log('accepted');
});

entryDialog.listen('MDCDialog:cancel', function() {
  console.log('canceled');
});

// slider values
const {MDCSlider} = mdc.slider;
const slider = new MDCSlider(document.querySelector('#judge-slider'));
slider.listen('MDCSlider:change', () => console.log(`Value changed to ${slider.value}`));

// ==== Authentication
const authDialog = new mdc.dialog.MDCDialog(document.querySelector('#auth-dialog'));

authDialog.listen('MDCDialog:accept', function() {
  console.log('accepted');
});

authDialog.listen('MDCDialog:cancel', function() {
  console.log('canceled');
});

// show sign up dialog
document.querySelector('#signUp').addEventListener('click', function(e){

});

// ==== Main page
// clicking on an entry
document.querySelectorAll('#contestant-list li').forEach( li => {
  li.addEventListener('click', function (e) {
    // now we need to figure out which item user clicked on
    if(e.currentTarget && e.currentTarget.nodeName == "LI") {
      //console.log(e.currentTarget.id + " was clicked");
      entryDialog.lastFocusedTarget = e.target;
      entryDialog.show();
      // HACK: this is to show sliders on a dialog correctly
      setTimeout(function(e){
        let event = document.createEvent('HTMLEvents');
        event.initEvent('resize', true, false);
        window.dispatchEvent(event);
        console.log("resize");
      },1000);
    }
  });
});




(function(){
  // configuration
  // const db = firebase.database().ref().child('config');
  // db.on('value', data => configuration(data.val()));
  configuration(appConfig);

  // show entries

  // users


  // ==================== Application functionality =======================

  // An event handler with calls the render function on every hashchange.
  // The render function will show the appropriate content of out page.

  // $(window).on('hashchange', function(){
  //   render(decodeURI(window.location.hash));
  // });
  //
  // function renderSingleEntry ( idx ) {
  //   let page = $('.single-entry'),
  //     container = $('.preview-entry');
  //   page.addClass('visible');
  // }
  //
  // function renderErrorPage () {
  //   let page = $('.error');
  //   page.addClass('visible');
  // }


}());
