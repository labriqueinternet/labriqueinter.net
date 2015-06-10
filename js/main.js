// Add CSS class about JS capability
document.querySelector('body').className += ' has-js ';

// ShowFeatures list button
document.querySelector('#show-features-button')
    .addEventListener('click', function(event) {
        // Prevent scrolling
        event.preventDefault();
        // Toggle features
        var features = document.querySelector('#features').style;
        features.display = (features.display != 'block') ? 'block' : 'none';
    }, false);

// firefox doesn't display subtitles by default
var videos = document.getElementsByTagName("video");
for (var i = 0; i < videos.length; i++) {
    if (videos[i].textTracks.length) {
        videos[i].textTracks[0].mode = "showing"
    }
}
