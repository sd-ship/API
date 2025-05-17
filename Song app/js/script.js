// console.log("sdfsdf")
let currentSong = new Audio();
let songs
let currfolder
function formatTime(timeInSeconds) {
    let totalSeconds = Math.floor(timeInSeconds); // or Math.round(timeInSeconds)
    let mins = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;

    let minStr = mins < 10 ? "0" + mins : mins.toString();
    let secStr = secs < 10 ? "0" + secs : secs.toString();

    return `${minStr}:${secStr}`;
}



async function getsongs(folder) {
    currfolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3") || element.href.endsWith(".m4a")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //play the first song 

    //show all the song in list
    let songul = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> <img src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Dhira</div>
                            </div>
                            <div class="playnow">
                                <img src="img/play.svg" alt="">
                            </div> </li>`;
        // console.log(song.replaceAll("%20", " "))
    }

    //Attch an event listener
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })


return songs;

}
const playMusic = (track, pause = false) => {
    // let audio = new Audio("/songs/"+track)
    currentSong.src = `/${currfolder}/` + track
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg"
    }
    // currentSong.play();
    //play.src="pause.svg"
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00  / 00:00"

     
     
}


async function displayalbum() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div)
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            console.log(folder)
            //get the metadata of folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder=${folder} class="card">
                        <div  class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" height="364px" viewBox="0 -960 960 960"
                                width="674px" fill="#000">
                                <path d="M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z"
                                    fill="#000" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpeg" alt="cover">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    // console.log(anchors)

    //load the playlist whenever the card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        //console.log(e)
        e.addEventListener("click", async item => {
            // console.log(`songs/${item.currentTarget.dataset.folder}`)
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
    

}

async function main() {

//Display all the albums on the page
    displayalbum();

    //get the list of all song
    await getsongs("songs/ncs");
    playMusic(songs[0], true)

    

    //Attach an event listener to play , next and prevoius
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause();
            play.src = "img/play.svg"
        }
    })
    

    currentSong.addEventListener("timeupdate", () => {
        //console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    //Add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
    //add an event lisener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //add an event lisener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })
    //add an event listener to privios and next
     pre.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs,index)
        if (index - 1 >= 0) {
            playMusic(songs[index - 1]);
        }
    })
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // console.log(songs,index)
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
    })

}
main();