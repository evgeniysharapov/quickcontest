/* globals: Handlebars, _, firebase */

// Register a helper
Handlebars.registerHelper('capitalize', function(str){
  // str is the argument passed to the helper when called
  str = str || '';
  return str.slice(0,1).toUpperCase() + str.slice(1);
});

// Returns true if entry has been done by the user
// Hackish because it's accessing window.cookOffContest 
Handlebars.registerHelper('entryDone', function(entry){
  return _.has(entry, `scorecards.${window.cookOffContest.userId}`);
});


const LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif';

const appConfig  = {
  appTitle: "Cook-Off",

  scorecard: [
    { name: "taste", min: 0, max: 10},
    { name: "texture", min: 0, max: 10},
    { name: "smell", min: 0, max: 10},
    { name: "presentation", min: 0, max: 10},
    { name: "expected", min: 0, max: 10},
    { name: "innovative", min: 0, max: 10}
  ]
};

function configuration ( cfg ) {
  const title = document.getElementById('appTitle');
  title.innerText = cfg.appTitle;
};

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

//_ CookOff class old style
function CookOffContest () {
  // User and authentication DOM Elements
  this.userPic = document.getElementById('user-pic');
  this.userName = document.getElementById('user-name');
  this.signInButton = document.getElementById('sign-in');
  this.signOutButton = document.getElementById('sign-out');
  
  this.signOutButton.addEventListener('click', this.signOut.bind(this));
  this.signInButton.addEventListener('click', this.signIn.bind(this));

  // Adding new entry DOM Elements 
  this.newEntryImage = document.getElementById('captureImage');
  this.newEntrySnapshot = document.getElementById('snapshot');
  this.newEntryTitle = document.getElementById("new-entry-title");
  this.newEntryDescription = document.getElementById("new-entry-description");
  
  this.initFirebase();

  this.contestantList = document.getElementById("contestant-list");
  
//_. Add contestant Entry Dialog  
  this.addDialog = new mdc.dialog.MDCDialog(document.querySelector('#add-entry'));

  this.addDialog.listen('MDCDialog:accept', this.addEntry.bind(this));

  this.addDialog.listen('MDCDialog:cancel', function() {
    this.resetTextField(this.newEntryTitle);
    this.resetTextField(this.newEntryDescription);
  }.bind(this));

  document.querySelector('#addEntry').addEventListener('click', this.addEntryAction.bind(this));
  
//_. Judgement Entry Dialog
  this.entryDialog = new mdc.dialog.MDCDialog(document.querySelector('#single-entry'));

  this.entryDialog.listen('MDCDialog:accept', this.updateScorecard.bind(this));

  this.entryDialog.listen('MDCDialog:cancel', function() {
    this.entry = undefined;
    console.log('canceled');
  });

  this.snackBar = new mdc.snackbar.MDCSnackbar(document.querySelector(".mdc-snackbar"));

  // show all the entries  
  this.displayEntries();

  // toolbar flexed
  let toolbar = mdc.toolbar.MDCToolbar.attachTo(document.querySelector('.mdc-toolbar'));
  toolbar.listen('MDCToolbar:change', function(evt) {
    var flexibleExpansionRatio = evt.detail.flexibleExpansionRatio;
  });
  
};

//_. showSnackbar
CookOffContest.prototype.showSnackbar = function ( snackbar, message, actionText, actionHandler) {
  snackbar.dismissesOnAction = true;
  let options =  {
    message, actionText, actionHandler,
    actionOnBottom: false,
    multiline: false,
    timeout: 3750
  };
  snackbar.show(options);
};

//_. addEntryAction
CookOffContest.prototype.addEntryAction = function (evt) {
    let currentUser = this.auth.currentUser;
    if( currentUser ) {
      // TODO: should check for authenticated user
      this.addDialog.lastFocusedTarget = evt.target;
      this.addDialog.show();
      this.newEntryImage.addEventListener('change', this.updateNewEntryImage.bind(this));
    } else {
      // show snackbar
      this.showSnackbar(this.snackBar, "You need to be authenticated to add!", "sign in", () => this.signIn() );
    }
};

//_. initFirebase
CookOffContest.prototype.initFirebase = function() {
  this.auth = firebase.auth();
  this.db = firebase.database();
  this.storage = firebase.storage();
  // configuration
  const db = this.db.ref().child('config');
  db.on('value', data => configuration(data.val()));
  // Authentication
  this.auth.onAuthStateChanged(this.onAuthStateChanged.bind(this));

  this.updateSignInOutButtons()
};

CookOffContest.prototype.updateSignInOutButtons = function() {
  if( this.auth.currentUser ) {
    this.signInButton.style.display = 'none';
    this.signOutButton.style.display = ''; // inherit
  } else {
    this.signOutButton.style.display = 'none';
    this.signInButton.style.display = '';    
  }
}

//_. signIn
CookOffContest.prototype.signIn = function() {
  // Sign in Firebase using popup auth and Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  this.auth.signInWithPopup(provider);
}

//_. signOut
CookOffContest.prototype.signOut = function () {
  // Sign out of Firebase.
  this.auth.signOut();
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
    
    this.userId = user.uid;
    
    // Show user's profile and sign-out button.
    this.userName.removeAttribute('hidden');
    this.userPic.removeAttribute('hidden');

  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    this.userName.setAttribute('hidden', 'true');
    this.userPic.setAttribute('hidden', 'true');
  }
  this.updateSignInOutButtons();
  this.displayEntries();
}

//_. Display Contest Entries
CookOffContest.prototype.displayContestEntries = function (data) {
  // Handlebars compilation
  let entrySource   = document.getElementById("entry-template").innerText;
  let entryTemplate = Handlebars.compile(entrySource);
  let entryHtml = entryTemplate(data);

  // clear up
  while(this.contestantList.firstChild){
    this.contestantList.removeChild(this.contestantList.firstChild);
  }
  this.contestantList.insertAdjacentHTML('beforeend',entryHtml);

//_ , Adding OnClick for Each Entry
  document.querySelectorAll('#contestant-list div.mdc-card').forEach( div => {
    div.addEventListener('click', this.showRatingDialog(data).bind(this));
  });
};

//_. showRateDialog
CookOffContest.prototype.showRatingDialog = (data) => function(e) {
  if( this.auth.currentUser ) { 
    //console.log(e.currentTarget.id + " was clicked");
    this.entryDialog.lastFocusedTarget = e.currentTarget;
    this.entryId = e.currentTarget.id;
    this.entry = data.entries[this.entryId];
    this.displayRatingEntry();
    // HACK: this is to show sliders on a dialog correctly
    setTimeout(e => {
      let event = document.createEvent('HTMLEvents');
      event.initEvent('resize', true, false);
      window.dispatchEvent(event);
      console.log("resize");
    },1000);
  } else {
      // show snackbar
    this.showSnackbar(this.snackBar, "You need to be authenticated to rate!", "sign in", () => this.signIn() );
  }
};


//_.  displayEntries
CookOffContest.prototype.displayEntries = function() {
  let entriesDb = this.db.ref().child('entries');
  entriesDb.off();
  entriesDb.on('value', data => {
    let entries = data.val();
    this.displayContestEntries({entries});
  });
};


//_. displayRatingEntry
CookOffContest.prototype.displayRatingEntry = function() {
  // check that we have authenticated user
  let currentUser = this.auth.currentUser;

  if(currentUser) {
    if (!this.entry) {
      console.error(`Couldn't find entry with '${this.entryId}'`);
      return;
    }

    // if entry has a scorecard for the current user show it
    // if entry doesn't hanve a scrorecard for the current user - use default one
    if( ! this.entry.scorecards ) {
      this.entry.scorecards = {};
    }
    if( ! this.entry.scorecards[currentUser.uid] ) {
      this.entry.scorecards[currentUser.uid] = appConfig.scorecard;
    }
   
    // TODO: extract it to pre-compiled 
    // find and compile Handlebars template and update it with data
    let judgeEntrySource   = document.getElementById("judge-entry-template").innerText;
    let judgeEntryTemplate = Handlebars.compile(judgeEntrySource);   
    let entryHtml = judgeEntryTemplate(Object.assign({}, this.entry, {scorecard: this.entry.scorecards[currentUser.uid]}));
    // clear up previous content and add a new one
    _.each(document.querySelectorAll('.judge-entry-dialog'), c => document.getElementById("rate-contestant").removeChild(c));
    document.getElementById("rate-contestant").insertAdjacentHTML('beforeend',entryHtml);

    //_ , Sliders
    _.each(this.entry.scorecards[currentUser.uid], e => {
      const slider = new mdc.slider.MDCSlider(document.querySelector(`#judge-slider-${e.name}`));
      // HACK: those sliders are very buggy (without this they do not show any value)
      slider.value = e.val;
        
      slider.listen('MDCSlider:change', evt => {
        let score = _.find(this.entry.scorecards[currentUser.uid], o => o.name === e.name)
        score.val = slider.value;
        document.querySelector(`#judge-slider-${e.name}-value`).innerText = `${slider.value}`;
        // console.log(`Value ${e.name} changed to ${slider.value}`);
        // console.log(`Details: ${evt}`);
      });
    });
    
    this.entryDialog.show();
  } else {
    // authenticate 
  }
};

//_. updateScorecard
CookOffContest.prototype.updateScorecard = function (e) {
  let entriesDb = this.db.ref().child('entries');
  entriesDb.update({[this.entryId] : this.entry}).then(() => {
    // clean up
    this.entryId = undefined;
    this.entry = undefined;
  });  
}


//_. addEntry
CookOffContest.prototype.addEntry = function() {
  let currentUser = this.auth.currentUser;
  let fileName = this.newEntryImage.files[0].name;
  let file = this.getScaledImageBlob();
 
  // upload image to cloud 
  let filePath = `${currentUser.uid}/${"test"}/${fileName}`;

  // upload entry with correct url
  this.db.ref().child('entries').push({
    title: this.newEntryTitle.value,
    description: this.newEntryDescription.value,
    author: currentUser.uid,
    image: LOADING_IMAGE_URL,
  }).then( data => {
    return this.storage.ref(filePath).put(file).then(snapshot => {
      // Get the file's Storage URI and update the entry.
      var fullPath = snapshot.metadata.fullPath;
      return data.update({
        image: this.storage.ref(fullPath).toString(),
        imageUri: snapshot.metadata.downloadURLs[0]
      });
    });
  }).then(() => {
    this.resetTextField(this.newEntryTitle);
    this.resetTextField(this.newEntryDescription);
    this.resetImage(this.newEntrySnapshot);
  }).catch( error => {
    console.error('There was an error crearing entry', error);
  });
};

// extract scaled blob of image from canvas
CookOffContest.prototype.getScaledImageBlob = function() {
  let arr = this.newEntrySnapshot.toDataURL("image/jpeg").split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});  
}

//_. updateNewEntryImage
CookOffContest.prototype.updateNewEntryImage = function (event) {
  event.preventDefault();
  let file = event.target.files[0];
  if( file != null ) {
    let reader = new FileReader();
    reader.onload = (e) => {
      let img = document.createElement('img');
      img.src = e.target.result;
      img.onload = (e) => {
        let canvas = this.newEntrySnapshot;
        
        // scale an image
        var MAX_WIDTH = 800;
        var MAX_HEIGHT = 600;
        var width = img.width;
        var height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
      }
    };
    reader.readAsDataURL(file);
  }
};



//_. resetTextField
CookOffContest.prototype.resetTextField = function(field) {
  field.value = "";
};

//_. resetImage
CookOffContest.prototype.resetImage = function(image) {
  image.src = "";
}



//_ Loading CookOff
window.onload = function(){
  window.cookOffContest = new CookOffContest();
}
