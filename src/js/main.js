document.addEventListener('DOMContentLoaded', () => {
    //const { render } = require("pug");
    const attrShowTime = 8; //景點面板出現時間(單位:秒)
    const renderTime = 2; //GPS取得資料的間隔時間(單位:秒)

    let runnerList = []; //追蹤的跑者清單
    let mapData = {}; //所有地圖資料
    let mapID = "map30" //
    let currentMap; // mapData[mapID] 取得目前播放地圖的資料包
    let soundPack = []; //聲音收集容器 會透過setAllSounds取得所有設定的audio
    let attrPack = []; //景點收集容器 會透過setAllAttr取得所有設定的audio
    let zoom = 1

    //#region 頁面控制 套院pageBtn按鈕配合取得datasets中的ID資料即可切換頁面
    const pages = document.querySelectorAll(".page")
    const btns = document.querySelectorAll(".pageBtn")

    let SSW = true //控制聲音避免重複播放 
    let step = 1
    let currentStep = 0

    //關閉所有頁面
    const closeAll = () => {
        pages.forEach(page => {
            page.style.display = "none"
        })
    }

    const openPage = pageID =>{
        closeAll()
        document.querySelector(pageID).style.display = "block"
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

    //防止double tap 測試
    window.onload = () => {
        document.addEventListener('touchstart', (event) => {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, {
            passive: false
        });

        let lastTouchEnd = 0;
        document.addEventListener('touchend', (event) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }


    //#region 地圖初始設定


    //聲音檔必須全部透過點擊後才會正常載入，所以此函式放在.GO.pageBtn，點下去後載入相關的聲音檔
    const setAllSounds = () => {
        if (mapID == "map30") {
            currentMap.maps.map((data, index) => {
                console.log(data.sound)
                if (data.sound) {
                    soundPack[index + 1] = new Audio(`./mp3/${mapID}/${data.sound}`)
                }
            })
        } else if (mapID == "map50") {
            //尚未設定
        }
    }

    const setAllAttr = () => {
        mapData.attractions.map(attr => {
            attrPack[attr.atid] = attr
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

    //#region 取得現在第幾步
    const getCurrentStep = () => {
        let step = 0
        //使用geolocation比對取得
        return step
    }
    //#endregion

    //#region 地圖控制+聲音播放
    const setMapStep = step => {
        //console.log(`render step:${step} pic:${currentMap.maps[step-1].pic}`)

        const loadImgMain = () => {
            const imgMain = new Image()
            //const src= `./${currentMap.path}/main/${step}.png`
            const src = `./img/${mapID}/main/${currentMap.maps[step-1].pic}`
            imgMain.src = src
            return new Promise((resolve, reject) => {
                imgMain.addEventListener("load", () => {
                    document.querySelector("#mapRenderer").style.backgroundImage = `url(${src})`
                    //document.querySelector("#mapRenderer").style.backgroundSize= `${ 150 * currentMap.maps[step-1].zoom}%`
                    document.querySelector("#mapRenderer").style.backgroundSize = `${ 150 * zoom}%`

                    //biker的騎乘方向 向左向右                   
                    document.querySelector("#biker").style.transform = `scaleX(${currentMap.maps[step-1].bikerDir == "L"?1:-1})`;
                    resolve(true)
                })
            })
        }


        loadImgMain().then(res => {
            if (res) {
                console.log('loadImgMain complete')
            } else {
                console.log('loadImgMain fail')
            }

            //設定顛坡圖的位置
            document.querySelector("#bumpPanel").style.backgroundPosition = `${currentMap.maps[step-1].bump}%`;

            //設定小地圖紅點的位置
            document.querySelector("#sideMap .marker").style.top = `${currentMap.maps[step-1].sideMap.y}%`;
            document.querySelector("#sideMap .marker").style.left = `${currentMap.maps[step-1].sideMap.x}%`;

            //設定卡片訊息
            if (currentMap.maps[step - 1].soundTxt && currentMap.maps[step - 1].soundTxt != "") {
                setMesgCard(true, currentMap.maps[step - 1].soundTxt)
            } else {
                setMesgCard(false)
            }

            //圖片讀取完後再輸出聲音
            if (SSW) {
                if (soundPack[step]) {
                    soundPack[step].play()
                } else {
                    console.log(`step ${step} no sound`)
                }
            }

            //設定景點資料
            setAttractions(currentMap.maps[step - 1].attrList)
        })

       
    }

    //設置景點
    let attrCount = 0
    const setAttractions = data => {
        const aBox = document.querySelector("#AttractionsBox")
        const attrPanel = document.querySelector("#attrPanel")
        let currentPoint;
        while (aBox.firstChild) {
            aBox.removeChild(aBox.lastChild)
        }
        //沒有資料的話就不用執行下面的步驟
        if (!data) return

        const timeCounter = () => {
            setTimeout(() => {
                if (attrCount < 0) {
                    attrCount = 0
                    attrPanel.classList.add('off')
                    attrPanel.classList.remove('on')
                    console.log('close')
                } else {
                    //console.log('left '+ myCount)
                    attrCount--
                    timeCounter()
                }
            }, 1000);
        }
        data.map(attr => {
            let point = document.createElement("div")
            point.classList.add("point")
            point.style.left = `calc(50% + ${attr.x * zoom }%)`
            point.style.top = `calc(50% + ${attr.y * zoom }%)`

            const loadAttrImg = () => {
                let img = new Image()
                img.src = `./img/attractions/${attrPack[attr.atid].pic}`
                return new Promise((resolve, reject) => {
                    img.addEventListener("load", () => {
                        attrPanel.classList.remove('off')
                        attrPanel.classList.add('on')
                        attrPanel.querySelector(".nameBox").innerHTML = attrPack[attr.atid].name
                        attrPanel.querySelector(".introBox").innerHTML = attrPack[attr.atid].intro
                        attrPanel.querySelector(".photoBox img").src = `./img/attractions/${attrPack[attr.atid].pic}`
                        resolve(true)
                    })
                })
            }

            point.addEventListener("click", () => {
                loadAttrImg()
                if (attrCount == 0) {
                    console.log("ccc", attrCount)
                    timeCounter()
                }
                attrCount = attrShowTime
            })

            point.innerHTML = '<img class="tree" src="./img/tree.svg"/>'
            aBox.appendChild(point)
        })


        //開發用：點地圖取得需設置景點的座標
        const _t = document.querySelector("#AttractionsBox")
        const _cw = _t.clientWidth
        const _ch = _t.clientHeight
        _t.addEventListener("mousedown", event => {
            console.log(((event.offsetX / _cw) * 100) - 50, ((event.offsetY / _ch) * 100) - 50)
        })

    }

    const setMesgCard = (isOpen, txt) => {
        const mesg = document.querySelector("#bumpPanel .message") //文字註解
        mesg.style.display = isOpen == true ? "block" : "none"
        mesg.innerHTML = txt
    }

    
    //#region 判斷有沒有隊友
    const checkHasParteners = ()=>{
        //沒有隊友的狀況
        //document.querySelector(".noPartener").style.display = 'block';
        //document.querySelector(".partenerList").style.display = 'none';
    }
    //#endregion

    //測試工具 正式上線後移除
    const setTestMapTool = () => {
        //let step=1
        document.querySelector(".testTool").style.display = 'block'
        const max = currentMap.maps.length
        document.querySelector("#prevStep").addEventListener("click", event => {
            if (step > 1) {
                step--
                document.querySelector("#currentStep").innerHTML = step
                //setMapStep(step)
            }
        })
        document.querySelector("#nextStep").addEventListener("click", event => {
            if (step < max) {
                step++;
                document.querySelector("#currentStep").innerHTML = step
                //setMapStep(step)
            }
        })

        document.querySelector("#zoomInOut").addEventListener("input", event => {
            zoom = event.target.value
            setMapStep(step)
        })


    }

    //讀取json設定檔
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
            mapData = res
            loadMapBasic()

            document.querySelector("#goSurveycake").addEventListener("click", () => {
                window.open("https://www.surveycake.com/", "_self")
            })
        }).catch(error => {
            console.error('json 取得失敗:', error)
        });
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

    //#region
    const preloadImg = src => {
        console.log(`image ${src} load `)
        const img = new Image()
        img.src = src
        img.onload = ()=>{
            console.log(`image ${src} load complete`)
        }
    }
    //#endregion
    
    const loadMapBasic = ()=>{
        //取得地圖資料byID
        currentMap = mapData[mapID]         
        preloadImg(`./img/${mapID}/main/${currentMap.maps[0].pic}`)
        preloadImg(`./img/${mapID}/side.png`)
        preloadImg(`./img/${mapID}/bump.png`)
    }

    //init
    closeAll()
    document.querySelector(`#user`).style.display = "block"
    setBtnsHandler()
    setRideTypeBtn()
    runnerAddHandler()
    loadMaps()
    checkHasParteners()
    
   
    document.querySelector("#route").addEventListener("change", event => {
        //console.log(event.target.value)
        mapID = event.target.value        
        loadMapBasic()
    })


    document.querySelector(".GO.pageBtn").addEventListener("click", () => {
        checkHasParteners()
        document.querySelector(".app").classList.add("full")
        //currentMap = mapData[mapID] //取得地圖資料byID

        document.querySelector("#bumpPanel").style.backgroundImage = `url(./img/${mapID}/bump.png)`
        document.querySelector("#sideMap").style.backgroundImage = `url(./img/${mapID}/side.png)`

        setTestMapTool() //測試工具，正式上線後移除此行即可
        setAllSounds()
        setAllAttr()


              

        
        console.log(`image load `)
    
        //關閉景點按鈕
        document.querySelector("#attrPanel .close").addEventListener("click", event => {
            document.querySelector("#attrPanel").classList.remove("on")
            document.querySelector("#attrPanel").classList.add("off")
            attrCount = attrShowTime
        })

        const render = () => {

            //getCurrentStep()

            //計算現在的步數
            //step = getCurrentStep()

            //let cStep = Math.floor(timer/6)+1
            if (currentStep != step) {
                currentStep = step
                SSW = true
            } else {
                SSW = false
            }

            setMapStep(step)
            //setMapStep(1)
            //setAttractions(step)
            setMesgCard(false)

            //當到達終點後 過3秒會進入終點畫面
            if(step == currentMap.maps.length){
                setTimeout(() => {
                    document.querySelector(".app").classList.remove("full")
                    openPage("#goal")
                }, 4000);
            }

        }
        document.querySelector("#currentStep").innerHTML = step
        setInterval(render, renderTime * 1000)
        render()
    })
})