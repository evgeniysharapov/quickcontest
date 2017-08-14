/* globals: Handlebars, _, firebase */

// Register a helper
Handlebars.registerHelper('capitalize', function(str){
  // str is the argument passed to the helper when called
  str = str || '';
  return str.slice(0,1).toUpperCase() + str.slice(1);
});

const appConfig  = {
  appTitle: "CookOff",

  scorecard: [
    { name: "taste", min: 0, max: 10},
    { name: "texture", min: 0, max: 10},
    { name: "smell", min: 0, max: 10},
    { name: "presentation", min: 0, max: 0},
    { name: "expected", min: 0, max: 10},
    { name: "innovative", min: 0, max: 10}
  ]
};


const contestEntries = [
  {
    id: "1234",
    title: "Puglia Bread",
    description: "Made with love",
    picture: "/assets/bread01.jpg",
    scores: [
      
    ]
  },
  {
    id: "3241",
    title: "Ciabatta",
    description: "Made with passion",
    picture: "/assets/bread01.jpg",
    scores: [
      
    ]
  },

  {
    id: "8976321",
    title: "French boule",
    description: "Great bread",
    picture: "/assets/bread01.jpg",
    scores: [
      
    ]
  },
  
];

function configuration ( cfg ) {
  const title = document.getElementById('appTitle');
  title.innerText = cfg.appTitle;
};

//_ Add contestant Entry Dialog
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

//_ Judgment Dialog
const entryDialog = new mdc.dialog.MDCDialog(document.querySelector('#single-entry'));

entryDialog.listen('MDCDialog:accept', function() {
  console.log('accepted');
});

entryDialog.listen('MDCDialog:cancel', function() {
  console.log('canceled');
});
//_. displayRatingEntry
function displayRatingEntry(id, entries) {
  // find entry in the list
  let entry = _.find(entries, (e) => e.id === id);
  
  // find and compile Handlebars template
  let judgeEntrySource   = document.getElementById("judge-entry-template").innerText;
  let judgeEntryTemplate = Handlebars.compile(judgeEntrySource);
  // if entry has a scorecard for the current user show it
  // if entry doesn't hanve a scrorecard for the current user - use default one
  if( ! entry.scorecard ) {
    entry.scorecard = appConfig.scorecard;
  }
  let entryHtml = judgeEntryTemplate(entry);
  // clear up previous content and add a new one
  _.each(document.querySelectorAll('.judge-entry-dialog'), c => document.getElementById("rate-contestant").removeChild(c));
  document.getElementById("rate-contestant").insertAdjacentHTML('beforeend',entryHtml);

//_ , Sliders
  const {MDCSlider} = mdc.slider;
  _.each(entry.scorecard, (e) => {
    const slider = new MDCSlider(document.querySelector(`#judge-slider-${e.name}`));
    slider.listen('MDCSlider:change', (evt) => {
      document.querySelector(`#judge-slider-${e.name}-value`).innerText = `${slider.value}`;
      console.log(`Value ${e.name} changed to ${slider.value}`);
      console.log(`Details: ${evt}`);
    });
  });
 
  entryDialog.show();
}

//_ Authentication
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

//_ Main page

//_. Display Contest Entries
function displayEntries (data) {
  let entrySource   = document.getElementById("entry-template").innerText;
  let entryTemplate = Handlebars.compile(entrySource);
  let entryHtml = entryTemplate(data);
  document.getElementById("contestant-list").insertAdjacentHTML('beforeend',entryHtml);

//_ , Adding OnClick for Each Entry
  document.querySelectorAll('#contestant-list li').forEach( li => {
    li.addEventListener('click', function (e) {
      // now we need to figure out which item user clicked on
      if(e.currentTarget && e.currentTarget.nodeName == "LI") {
        //console.log(e.currentTarget.id + " was clicked");
        entryDialog.lastFocusedTarget = e.currentTarget;
        displayRatingEntry(e.currentTarget.id, contestEntries);
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
}
  

//_ CookOff class old style
function CookOffContest () {
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  this.initFirebase();
  displayEntries({entries: contestEntries});
}

//_. initFirebase
CookOffContest.prototype.initFirebase = function() {

  this.auth = firebase.auth();
  this.db = firebase.database();
  this.stor = firebase.storage();

  // configuration
  const db = this.db.ref().child('config');
  db.on('value', data => configuration(data.val()));

  // Authentication
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));
}

//_. onAuthStateChanged
CookOffContest.prototype.onAuthStateChanged = function(user) {
  if (user) { // User is signed in!
    // Get profile pic and user's name from the Firebase user object.
    var profilePicUrl = user.photoURL;
    var userName = user.displayName;

    // Set the user's profile pic and name.
    this.userPic.style.backgroundImage = 'url(' + (profilePicUrl || '/assets/profile_placeholder.png') + ')';
    this.userName.textContent = userName;

    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');
    this.signOutButton.removeAttribute('hidden');
    // Hide sign-in button.
    this.signInButton.setAttribute('hidden', 'true');

    // We load currently existing chant messages.
    this.loadMessages();

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
    this.signOutButton.setAttribute('hidden', 'true');
    // Show sign-in button.
    this.signInButton.removeAttribute('hidden');
  }
}

//_ Loading CookOff
window.onload = function(){
  window.cookOffContest = new CookOffContest();
}
