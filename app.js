/* globals: Handlebars, $, firebase */

const appConfig  = {
  appTitle: "CookOff"
};

const entries = {
};
// initial showing
document.getElementById('single-entry').className="hidden";
document.getElementById('all-entries').className="active";

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
const authDialog = new mdc.dialog.MDCDialog(document.querySelector('#auth-dialog'));
const {MDCSlider} = mdc.slider;

authDialog.listen('MDCDialog:accept', function() {
  console.log('accepted');
});

authDialog.listen('MDCDialog:cancel', function() {
  console.log('canceled');
});


// slider values
const slider = new MDCSlider(document.querySelector('.mdc-slider'));
slider.listen('MDCSlider:change', () => console.log(`Value changed to ${slider.value}`));


// ==== Authentication
// show sign up dialog
document.querySelector('#signUp').addEventListener('click', function(e){

});

// ==== Main page

function displayEntry(id){
    document.getElementById('all-entries').className = "hidden";
    document.getElementById('single-entry').className = "active";
}

function hideEntry(){
    document.getElementById('single-entry').className = "hidden";
    document.getElementById('all-entries').className = "active";
}


// clicking on an entry
document.querySelectorAll('#contestant-list li').forEach( li => {
  li.addEventListener('click', function (e) {
    // now we need to figure out which item user clicked on
    if(e.currentTarget && e.currentTarget.nodeName == "LI") {
      //console.log(e.currentTarget.id + " was clicked");
      displayEntry(e.currentTarget.id);
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
