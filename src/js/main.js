const { render } = require("pug");


let runnerList = [];//追蹤的跑者清單
let mapData = {};//地圖資料

document.addEventListener('DOMContentLoaded', () => {
    const pages = document.querySelectorAll(".page")
    const btns = document.querySelectorAll(".pageBtn")

    const closeAll = () => {
        //alert("closeAll")
        pages.forEach(page => {
            page.style.display = "none"
        })
    }
    const setBtnsHandler = () => {
        btns.forEach(btn => {
            btn.addEventListener("click", event => {
                closeAll()
                document.querySelector(`#${event.currentTarget.dataset.id}`).style.display = "block"
            })
        })
    }
    
    const runnerAddHandler = ()=>{
        let runnerList = [];
        const boxUser = document.querySelector("#runnerBox")//user頁面
        const boxSuggest = document.querySelector("#myRunnerList")//suggest頁面
        const runnerName = document.querySelector("#runnerName")
        
        renderRunner = box =>{
            while(box.firstChild){
                box.removeChild(box.lastChild)
            }    
            runnerList.map(name=>{
                let member = document.createElement("div")
                member.classList.add("memberLabel")
                member.innerHTML= name
                box.appendChild(member)
            })
        }

        document.querySelector("#addRunner").addEventListener("click",()=>{
           
            if(runnerName.value != ''){
                runnerList.push(runnerName.value)
                renderRunner(boxUser)
                renderRunner(boxSuggest)
                runnerName.value =""
            }else{
                alert("尚未填寫")
            }
            console.log(runnerList)
        })        
    }

    const setMapStep = step =>{
        //document.querySelector("#mapRenderer").style.backgroundImage= `url(./${mapData.path}/main/${mapData.list[step].pic})`
        document.querySelector("#mapRenderer").style.backgroundImage= `url(./${mapData.path}/main/${step}.png)`
        document.querySelector("#sideMap").style.backgroundImage= `url(./${mapData.path}/side/${step}.png)`
        document.querySelector("#currentStep").innerHTML=step
        

       
    }

    //設置景點
    const setAttractions= step =>{
        const aBox = document.querySelector("#AttractionsBox")
        const bumpPanel = document.querySelector("#bumpPanel")
        const attrPanel = document.querySelector("#attrPanel")
        while(aBox.firstChild){
            aBox.removeChild(aBox.lastChild)
        } 
        mapData.attractions.map(attr=>{
            if(attr.step != undefined && attr.step == step){
                let point = document.createElement("div")
                point.classList.add("point")
                point.style.left = `${attr.x}%`
                point.style.top = `${attr.y}%`
                point.addEventListener("click",()=>{
                    bumpPanel.style.display="none";
                    attrPanel.style.display="flex";
                    attrPanel.querySelector(".photoBox img").src=`./img/attractions/${attr.pic}`
                    attrPanel.querySelector(".nameBox").innerHTML = attr.name
                    attrPanel.querySelector(".introBox").innerHTML = attr.intro
                    setTimeout(() => {
                        bumpPanel.style.display="flex";
                        attrPanel.style.display="none";
                    }, 8000);
                })
                point.innerHTML = "O"
                aBox.appendChild(point)
            }
        })
    }

    const setSound = step =>{
        mapData.sounds.map(sound=>{
            if(step == sound.step){
                var audio = new Audio(`./mp3/${sound.mp3}`);
                audio.play();
            }
        })
    }

    const setTestMapTool = () =>{
        let step=1
        const max = mapData.list
        document.querySelector("#prevStep").addEventListener("click",event=>{
            if(step>1){
                step--
                console.log(step)
                setMapStep(step)
                setAttractions(step)
                setSound(step)
            }
        })
        document.querySelector("#nextStep").addEventListener("click",event=>{
            if(step<max){
                step++
                console.log(step)
                setMapStep(step)                
                setAttractions(step)
                setSound(step)
            }
        })
    }

    const loadMaps=()=>{
        fetch("./js/maps.json", {
            method: 'GET'
        }).then(response => { 
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            if(res){
                //mapData = res
                return res
            }else{
                alert("取得地圖資料失敗")
            }                     
        }).then(res=>{
            //console.log(res.map1.list[0].pic)
            //document.querySelector("#mapRenderer").style.backgroundImage= `url(./${mapData.map1.path}/${mapData.map1.list[0].pic})`
            
            mapData = res.map1
            setMapStep(1)
            setTestMapTool()
            /*document.querySelector("#silderMap").addEventListener("input",event=>{
                let sn = event.currentTarget.value
                document.querySelector("#mapRenderer").style.backgroundImage= `url(./${mapData.map1.path}/${mapData.map1.list[sn].pic})`
            })*/
            
            //mapData.map1
        }).catch(error => {
            console.error('jsonip 取得失敗:', error)
            //reject()
        });
    }
    
   

    //init
    closeAll()
    //document.querySelector(`#user`).style.display = "block"
    document.querySelector(`#riderMap`).style.display = "block"
    setBtnsHandler()
    runnerAddHandler()
    loadMaps()
})