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
$("video").textTracks[0].mode = "showing"
