$(document).ready(function() {

    $('#postJobBtn').click(function() {
        $('#postJobForm').toggle();
        $('#loginForm').hide();
    });

    $('#homeBtn').click(function() {
        $('#loginForm').hide();
        $('#postJobForm').hide();
    });
});