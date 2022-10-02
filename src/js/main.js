//const { render } = require("pug");
const attrShowTime =8000;//景點面板出現時間
const renderTime =2000;//景點面板出現時間

let runnerList = []; //追蹤的跑者清單
let mapData = {}; //地圖資料

document.addEventListener('DOMContentLoaded', () => {
    //#region 頁面控制 套院pageBtn按鈕配合取得datasets中的ID資料即可切換頁面
    const pages = document.querySelectorAll(".page")
    const btns = document.querySelectorAll(".pageBtn")
    
    let SSW = true //控制聲音避免重複播放 
    let step = 1
    let currentStep = 0

    document.querySelector(".GO.pageBtn").addEventListener("click", () => {

        document.querySelector(".app").classList.add("full")

        //聲音檔必須全部透過點擊後才會正常載入
        //safari不給使用動態建立audio，因此只能逐項建立音檔audio物件
        let downhillMp3 = new Audio("./mp3/downhill.mp3")
        let uphillMp3 = new Audio("./mp3/uphill.mp3")
        let beforeGoalMp3 = new Audio("./mp3/beforeGoal.mp3")
    
        const render = () => {
            console.log(`render step ${step}`)
            //let cStep = Math.floor(timer/6)+1
            if (currentStep != step) {
                currentStep = step
                SSW = true
            } else {
                SSW = false
            }
            setMapStep(step)
            setAttractions(step)
            setMesgCard(false)
            mapData.sounds.map(sound=>{
                if(sound.step == step){
                    if(SSW){
                        switch(sound.mp3){
                            case "downhill":
                                downhillMp3.play()
                            break;
                            case "uphill":
                                uphillMp3.play()
                            break;
                            case "beforeGoal":
                                beforeGoalMp3.play()
                            break;
                        }                        
                    }
                    setMesgCard(true, sound.txt)
                }
            })
            //setBump(step)
        }
        document.querySelector("#currentStep").innerHTML = step
        
        setInterval(render, renderTime)
    })

    //關閉所有頁面
    const closeAll = () => {
        pages.forEach(page => {
            page.style.display = "none"
        })
    }

    //將所有的pageBtn設定click後的行為
    const setBtnsHandler = () => {
        btns.forEach(btn => {
            btn.addEventListener("click", event => {
                closeAll()
                document.querySelector(`#${event.currentTarget.dataset.id}`).style.display = "block"
            })
        })
    }
    //#endregion

    //#region 追蹤跑者控制 將使用者輸入的跑者號碼帶入到指定的div中
    const runnerAddHandler = () => {
        let runnerList = [];
        const boxUser = document.querySelector("#runnerBox") //user頁面
        const boxSuggest = document.querySelector("#myRunnerList") //suggest頁面
        const runnerName = document.querySelector("#runnerName")

        //將runnerList蒐集到的資料render跑者的標籤
        renderRunner = box => {
            while (box.firstChild) {
                box.removeChild(box.lastChild)
            }
            runnerList.map(name => {
                let member = document.createElement("div")
                member.classList.add("memberLabel")
                member.innerHTML = name
                box.appendChild(member)
            })
        }

        //點選+號寫入runnerList中，這邊未來需要與後端驗證跑者的資料
        document.querySelector("#addRunner").addEventListener("click", () => {
            if (runnerName.value != '') {
                runnerList.push(runnerName.value)
                renderRunner(boxUser)
                renderRunner(boxSuggest)
                runnerName.value = ""
            } else {
                alert("尚未填寫")
            }
            console.log(runnerList)
        })
    }
    //#endregion 追蹤跑者控制

    //#region 地圖控制
    const setMapStep = step => {
        //document.querySelector("#mapRenderer").style.backgroundImage= `url(./${mapData.path}/main/${mapData.list[step].pic})`
        /*
        const imgMain = new Image()
        imgMain.src = `./${mapData.path}/main/${step}.png`

        const imgSide = new Image()
        imgMain.src = `./${mapData.path}/side/${step}.png`
        
        const imgBump = new Image()
        imgMain.src = `./${mapData.path}/bump/${step}.png`

        document.querySelector("#mapRenderer").style.backgroundImage = `url(./${mapData.path}/main/${step}.png)`
        document.querySelector("#sideMap").style.backgroundImage = `url(./${mapData.path}/side/${step}.png)`
        */
        //document.querySelector("#currentStep").innerHTML=step
        
        const loadImgMain = ()=>{
            const imgMain = new Image()
            imgMain.src = `./${mapData.path}/main/${step}.png`
            return new Promise((resolve, reject)=>{
                imgMain.addEventListener("load",()=>{  
                    document.querySelector("#mapRenderer").style.backgroundImage= `url(./${mapData.path}/main/${step}.png)`
                    resolve(true)    
                })
            })
        } 

        const loadImgSide = ()=>{
            const imgSide = new Image()
            imgSide.src = `./${mapData.path}/side/${step}.png`
            return new Promise((resolve, reject)=>{
                imgSide.addEventListener("load",()=>{
                    document.querySelector("#sideMap").style.backgroundImage= `url(./${mapData.path}/side/${step}.png)`
                    //document.querySelector("#currentStep").innerHTML=step
                    resolve(true)    
                })
            })
        } 
        
        const loadImgBump = ()=>{
            const imgBump = new Image()
            imgBump.src = `./${mapData.path}/bump/${step}.png`
            return new Promise((resolve, reject)=>{
                imgBump.addEventListener("load",()=>{
                    document.querySelector("#bumpPanel").style.backgroundImage= `url(./${mapData.path}/bump/${step}.png)`
                    resolve(true)    
                })
            })
        } 

        loadImgMain().then(res=>{
            if(res){
                console.log('loadImgMain complete')
                return loadImgSide()
            }else{
                console.log('loadImgMain fail')
            }
        }).then(res=>{
            if(res){
                console.log('loadImgSide complete')
                return loadImgBump()
            }else{
                console.log('loadImgSide fail')
            }
        }).then(res=>{
            if(res){
                console.log('loadImgBump complete')
            }else{
                console.log('loadImgBump fail')
            }
        })
        /*
        imgSide.addEventListener("load",()=>{  
            //console.log("loaded imgSide")
            document.querySelector("#sideMap").style.backgroundImage= `url(./${mapData.path}/side/${step}.png)`
            document.querySelector("#currentStep").innerHTML=step
        })

        loadImgMain.then(()=>{
            
        })
        */
    }

    //設置景點
    const setAttractions = step => {
        const aBox = document.querySelector("#AttractionsBox")
        const bumpPanel = document.querySelector("#bumpPanel")
        const attrPanel = document.querySelector("#attrPanel")
        while (aBox.firstChild) {
            aBox.removeChild(aBox.lastChild)
        }
        mapData.attractions.map(attr => {
            if (attr.step != undefined && attr.step == step) {
                let point = document.createElement("div")
                point.classList.add("point")
                point.style.left = `${attr.x}%`
                point.style.top = `${attr.y}%`
                point.addEventListener("click", () => {
                    //bumpPanel.style.display = "none";
                    attrPanel.classList.remove('off')
                    attrPanel.classList.add('on')

                    attrPanel.querySelector(".photoBox img").src = `./img/attractions/${attr.pic}`
                    attrPanel.querySelector(".nameBox").innerHTML = attr.name
                    attrPanel.querySelector(".introBox").innerHTML = attr.intro
                    setTimeout(() => {
                        //bumpPanel.style.display = "flex";
                        attrPanel.classList.add('off')
                        attrPanel.classList.remove('on')
                        //attrPanel.style.display = "none";
                    }, attrShowTime);
                })
                point.innerHTML = '<img class="tree" src="./img/tree.svg"/>'
                aBox.appendChild(point)
            }
        })
    }
    /*
    const getAllSounds = ()=>{
        let lib = [];
        mapData.sounds.map(data=>{
            let audio = new Audio(`./mp3/${data.mp3}`);            
            let pack={
                "step":data.step,
                "audio":audio,
                "txt":data.txt
            }
            lib.push(pack)
        })
        return lib
    }
    */

    const setSound = step => {
        const mesg = document.querySelector("#bumpPanel .message") //文字註解
        mesg.style.display = "none"

        mapData.sounds.map(sound => {
            if (step == sound.step && SSW) {
                let audio = new Audio(`./mp3/${sound.mp3}`);
                audio.play();
                //設定註解內容
                mesg.innerHTML = sound.txt
                mesg.style.display = "block"
            }
        })
    }

    const setMesgCard = (isOpen,txt) => {
        const mesg = document.querySelector("#bumpPanel .message") //文字註解
        mesg.style.display = isOpen == true?"block":"none"
        mesg.innerHTML = txt
    }

    

    //顛坡圖設定
    const setBump = step => {
        const bump = document.querySelector("#bumpPanel");
        bump.style.backgroundImage = `url(./img/maps/1/bump/${step}.png)`;
    }

    //測試工具 正式上線後移除
    const setTestMapTool = () => {
        //let step=1
        const max = mapData.list
        document.querySelector("#prevStep").addEventListener("click", event => {
            if (step > 1) {
                step--
                document.querySelector("#currentStep").innerHTML = step              
            }
        })
        document.querySelector("#nextStep").addEventListener("click", event => {
            if (step < max) {
                step++;
                document.querySelector("#currentStep").innerHTML = step
            }
        })

    }

    //讀取json設定檔，
    const loadMaps = () => {
        fetch("./js/maps.json", {
            method: 'GET'
        }).then(response => {
            if (response.ok) {
                return response.json();
            }
        }).then(res => {
            if (res) {
                return res
            } else {
                alert("取得地圖資料失敗")
            }
        }).then(res => {
            mapData = res.map1
            setMapStep(1)
            setBump(1)
            setTestMapTool()

            document.querySelector("#goSurveycake").addEventListener("click", () => {
                window.open("https://www.surveycake.com/", "_self")
            })
        }).catch(error => {
            console.error('jsonip 取得失敗:', error)
        });
    }

    //由於本機開啟頁面沒辦法讀取json 因此使用測試的func來模擬讀取
    const loadMapsTest = () => {
        mapData = {
            "path": "img/maps/1",
            "list": 10,
            "attractions": [{
                    "name": "上品擂茶",
                    "intro": "店內光是這種紅色磁磚地板、紅磚牆面、復古沐桂、蓑衣、斗笠、農具，就有種回到鄉下的感覺。",
                    "pic": "1.jpg",
                    "step": 3,
                    "x": 40,
                    "y": 30
                },
                {
                    "name": "西瓜莊",
                    "intro": "「西瓜莊園」聽到名字第一個讓人聯想到的是，這裡種西瓜？還是西瓜吃到飽呢？呵～其實這裡不種西瓜，更沒有西瓜田，西瓜莊園是一間以西瓜為主題的親子餐廳。",
                    "pic": "2.jpg",
                    "step": 3,
                    "x": 50,
                    "y": 80
                },
                {
                    "name": "牛奶芽",
                    "intro": "我們原本是一間位於北埔冷泉上方的有機芽菜農場，有一天小孩子貪玩把牛奶倒入芽菜桶裡，心想：完蛋了！應該整桶都壞掉了吧！？沒想到栽培出來的芽菜更加清甜",
                    "pic": "3.jpg",
                    "step": 8,
                    "x": 50,
                    "y": 20
                }
            ],
            "sounds": [{
                    "step": "1",
                    "mp3": "downhill",
                    "txt": "前面是下坡 請小心騎乘"
                },
                {
                    "step": "3",
                    "mp3": "uphill",
                    "txt": "前面是上坡，請加油"
                },
                {
                    "step": "5",
                    "mp3": "beforeGoal",
                    "txt": "快要到終點了，再努力一下"
                }
            ]
        }
        setMapStep(1)
        setBump(1)
        setTestMapTool()

        document.querySelector("#goSurveycake").addEventListener("click", () => {
            window.open("https://www.surveycake.com/", "_self")
        })
    }
    //#endregion

    //#region 跑者模式選擇頁面
    const setRideTypeBtn = () => {
        const btns = document.querySelectorAll(".rideType")
        const _closeAll = () => {
            btns.forEach(btn => {
                btn.classList.remove("on")
            })
        }
        btns.forEach(btn => {
            btn.addEventListener("click", event => {
                _closeAll()
                event.currentTarget.classList.add("on")
            })
        })
    }
    //#endregion


    //init
    closeAll()
    document.querySelector(`#user`).style.display = "block"
    setBtnsHandler()
    setRideTypeBtn()
    runnerAddHandler()
    loadMaps()
    //loadMapsTest() //測試用
})