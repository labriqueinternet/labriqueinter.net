// Add CSS class about JS capability
document.querySelector('body').className += ' has-js ';

// ShowFeatures list button
var showFeaturesButton = document.querySelector('#show-features-button');
showFeaturesButton ? showFeaturesButton.addEventListener('click', function(event) {
    // Prevent scrolling
    event.preventDefault();
    // Toggle features
    var features = document.querySelector('#features').style;
    features.display = (features.display != 'block') ? 'block' : 'none';
}, false) : null;

// firefox doesn't display subtitles by default
var videos = document.getElementsByTagName("video");
for (var i = 0; i < videos.length; i++) {
    if (videos[i].textTracks.length) {
        videos[i].textTracks[0].mode = "showing"
    }
}

// Anchor links helper
var anchorTitles = document.querySelectorAll('section[id]');
for(var i = 0; i < anchorTitles.length; i++) {

    // Create anchorLink
    var anchorLink = document.createElement("a");
    anchorLink.classList.add('anchor-link');
    anchorLink.href = '#' + anchorTitles[i].id;
    anchorLink.innerHTML = '#';

    // Append to anchorTitles
    anchorTitles[i].insertBefore(anchorLink, anchorTitles[i].childNodes[0]);
}