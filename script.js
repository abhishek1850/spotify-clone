let currentSong = new Audio();
let songs;
let currFolder;

document.querySelectorAll(".album").forEach(e => {
    let div = document.createElement("div")
    div.classList.add("splay")

    let img = document.createElement("img")
    img.src = "images/splay.svg"
    img.alt = ""

    div.appendChild(img);
    e.appendChild(div)
})

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder

    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`)
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")

    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    // show all song in playlist
    let songUL = document.querySelector(".music").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>  
               <img src="images/m.svg"  class="filter">
               <div class="info">
                 <div> ${song.replaceAll("%20", " ")} </div>
                  
               </div>                      
               <img src="images/play.svg" class="filter">                          
          </li>`;
    }

    // attach an event listen to play each song
    document.querySelectorAll(".music ul li").forEach(e => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").textContent.trim());
        });
    });


    return songs
}

const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+ track)
    currentSong.src = `http://127.0.0.1:3000/${currFolder}/` + track;

    // currentSong.play();
    if (!pause) {
        currentSong.play()
        play.src = "images/paused.svg"
    }
    console.log("Playing song:", currentSong.src);

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

async function main() {
    // get the list of all the songs
    await getSongs("music/Arijit_sigh")

    playMusic(songs[0], true)
    //display all the albums on the page

    // Attach an event listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/paused.svg"
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg"
        }
    })

    //Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.currentTarget.clientWidth) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    //add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    //add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()
        console.log("Next Clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    //add an event listener to volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to ", e.target.value, "/100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
    })
    //add an event listener for mute
    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            // previousvalue = currentSong.volume
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;

        }
        else if (e.target.src.includes("mute.svg")) {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })

    //Load the playlist whenever the album is clicked
    Array.from(document.getElementsByClassName("album")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`music/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
    })
}
main()
