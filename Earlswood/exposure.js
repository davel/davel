// vim:ts=4:shiftwidth=4:expandtab

window.addEventListener("load", function() {
    const passive = {
        passive : true
    };

    const rate = Math.pow(383, 0.5) / 40;

    var vid  = document.getElementById("vid");
    var time = document.getElementById("exposure");

    vid.addEventListener("timeupdate", function() {
        var exposures_in_frame = Math.pow(vid.currentTime * rate, 2)+1;
        if (exposures_in_frame > 384) {
            exposures_in_frame = 384;
        }
        var str = exposures_in_frame.toFixed(1);
        while (str.length < 5) {
            str = "\u{2007}"+str;
        }
        time.innerText = str + "s";
    }, passive);
}, );
