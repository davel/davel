// vim:ts=4:shiftwidth=4:expandtab:smartindent

(function() {
    let on_top;

    const duration = 323.0/50.0;

    const line = document.getElementById("line");
    const dragme = document.getElementById("dragme");
    const exposure_display = document.getElementById("exposure");
    const video_box = document.getElementById("video_box");
    const res_4k = document.getElementById("4k_res");
    const res_2k = document.getElementById("2k_res");
    const res_1k = document.getElementById("1k_res");

    function display_details(number) {
        const exposure = Number(2**(number/4+1)).toFixed(1);
        const iso      = Number(80*(2**6.7) / (2**(number/4+1))).toFixed(0);
        exposure_display.innerText = exposure+"s ISO "+iso;
    }

    function get_vid(number) {
        const old_vid = document.getElementById("vid"+number);
        if (old_vid) {
            return old_vid;
        }
        const new_vid = document.createElement("video");
        new_vid.className = "full";
        new_vid.defaultMuted = new Boolean(true);
        new_vid.loop         = new Boolean(true);
        new_vid.controls = false;
        new_vid.style.zIndex = -2;
        new_vid.muted = new Boolean(true);

        function add_source(res, ext) {
            const new_source = document.createElement("source");
            new_source.src  = "https://a-forest-"+res+".davel.me.uk/forest-"+number+"-"+res+"."+ext;
            new_vid.appendChild(new_source);
        }

        if (res_4k.checked) {
            // Firefox struggles with 4k, so only attempt if you really need
            // the pixels.
            add_source("4k-h265", "mp4");
            add_source("4k-vp9", "webm");
            add_source("4k-h264", "mp4");
        }

        if (res_4k.checked || res_2k.checked) {
            add_source("1k-vp9", "webm");
            add_source("1k-h264", "mp4");
        }

        add_source("1k-vp9", "webm");
        add_source("1k-h264", "mp4");

        video_box.appendChild(new_vid);
        new_vid.id = "vid"+number;

        new_vid.addEventListener("canplay", (e) => {
            new_vid.play();
        });


        new_vid.addEventListener("timeupdate", (e) => {
            if (on_top == e.target) {
                const angle = (e.target.currentTime / duration)*360;
                line.setAttribute("transform", "rotate("+angle+")");
            }
        });

        return new_vid;
    }

    document.getElementById("exposure_slider").addEventListener("input", (e) => {
        const new_exposure = Math.floor(e.target.value)-1;
        const new_vid = get_vid(new_exposure);
        new_vid.play();


        let sync_diff = on_top.currentTime - new_vid.currentTime;
        if (sync_diff > (duration/2)) {
            sync_diff = sync_diff - duration;
        }

        if (Math.abs(sync_diff) > 0.4) {
            console.log("out of sync "+sync_diff);
            new_vid.currentTime = on_top.currentTime;
        }
        else {
            console.log("in sync "+sync_diff);
        }
        new_vid.style.zIndex = -1;
        on_top.style.zIndex  = -2;

        on_top = new_vid;

        dragme.className="dragme dragme_hidden";

        display_details(new_exposure);
    });

    window.addEventListener("load", (e) => {
        const slider = document.getElementById("exposure_slider");
        const starting_slider = Math.floor(slider.value)-1;
        on_top = get_vid(starting_slider);
        on_top.style.zIndex = -1;
        on_top.autoplay = Boolean(true);
        on_top.play();

        display_details(starting_slider);

        function change_res(e) {
            if (e.target.checked) {
                while (video_box.firstChild) {
                    video_box.removeChild(video_box.lastChild);
                }
                const new_exposure = Math.floor(slider.value)-1;
                on_top = get_vid(new_exposure);
                on_top.style = -1;
                on_top.play();
            }

        }

        res_1k.addEventListener("change", change_res);
        res_2k.addEventListener("change", change_res);
        res_4k.addEventListener("change", change_res);

        window.setInterval(function() {
            for (let i=0; i<33; i++) {
                const found = document.getElementById("vid"+i);
                if (!found) {
                    get_vid(i);
                    return;
                }
            }
        }, 10011);

        window.setInterval(function() {
            const new_exposure = Math.floor(slider.value)-1;

            let we_have_added_one = false;
            function pause_or_load(i) {
                const found = document.getElementById("vid"+i);
                if (found) {
                    found.pause();
                }
            }

            for (let i=0; i<(new_exposure-1); i++) {
                pause_or_load(i);
            }
            for (let i=new_exposure+2; i<33; i++) {
                pause_or_load(i);
            }

            const attempt_sync = function(v) {
                if (v.paused) {
                    v.play();
                }
                let error = (on_top.currentTime-v.currentTime);
                if (error > (duration/2)) {
                    error = error - duration;
                }
                else if (error < (-duration/2)) {
                    error = error + duration;
                }


                let target_time = (v.currentTime + error * 1.1) % duration;
                if (target_time<0) {
                    target_time = target_time + duration;
                }
                v.currentTime = target_time;
            };

            if (on_top.currentTime > 0 && on_top.currentTime < (duration-1.5)) {
                if (new_exposure>0) {
                    attempt_sync(get_vid(new_exposure-1));
                }
                if (new_exposure<32) {
                    attempt_sync(get_vid(new_exposure+1));
                }
            }

        }, 300);
    });
}) ();
