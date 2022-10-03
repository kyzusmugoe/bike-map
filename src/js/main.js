//const { render } = require("pug");
const attrShowTime =8;//景點面板出現時間(單位:秒)
const renderTime =2;//GPS取得資料的間隔時間(單位:秒)

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
        setInterval(render, renderTime*1000)
        render()
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
                //console.log('loadImgMain complete')
                return loadImgSide()
            }else{
                console.log('loadImgMain fail')
            }
        }).then(res=>{
            if(res){
                //console.log('loadImgSide complete')
                return loadImgBump()
            }else{
                console.log('loadImgSide fail')
            }
        }).then(res=>{
            if(res){
                //console.log('loadImgBump complete')
            }else{
                console.log('loadImgBump fail')
            }
        })
    }

    //設置景點
    let myCount = 0
    const setAttractions = step => {
        const aBox = document.querySelector("#AttractionsBox")
        const bumpPanel = document.querySelector("#bumpPanel")
        const attrPanel = document.querySelector("#attrPanel")


        while (aBox.firstChild) {
            aBox.removeChild(aBox.lastChild)
        }

        const timeCounter = ()=>{
             setTimeout(() => {
                if(myCount <0){
                    myCount = 0
                    attrPanel.classList.add('off')
                    attrPanel.classList.remove('on')
                    console.log('close')
                }else{
                    //console.log('left '+ myCount)
                    myCount--
                    timeCounter()
                }
            }, 1000);
        }

        mapData.attractions.map(attr => {
            if (attr.step != undefined && attr.step == step) {
                let point = document.createElement("div")
                point.classList.add("point")
                point.style.left = `${attr.x}%`
                point.style.top = `${attr.y}%`

                const loadAttrImg = ()=>{
                    let img = new Image()
                    img.src=`./img/attractions/${attr.pic}`
                    return new Promise((resolve, reject)=>{
                        img.addEventListener("load",()=>{
                            attrPanel.classList.remove('off')
                            attrPanel.classList.add('on')
                            attrPanel.querySelector(".nameBox").innerHTML = attr.name
                            attrPanel.querySelector(".introBox").innerHTML = attr.intro
                            attrPanel.querySelector(".photoBox img").src = `./img/attractions/${attr.pic}`
                            resolve(true)    
                        })
                    })
                } 

                point.addEventListener("click", () => {
                    //attrPanel.classList.remove('off')
                    //attrPanel.classList.add('on')                    
                    //attrPanel.querySelector(".photoBox img").src = `./img/attractions/${attr.pic}`
                    //attrPanel.querySelector(".nameBox").innerHTML = attr.name
                    //attrPanel.querySelector(".introBox").innerHTML = attr.intro
                    loadAttrImg()
                    if(myCount == 0){
                        console.log("ccc", myCount)
                        timeCounter()                   
                    }
                    myCount = attrShowTime
                })
                point.innerHTML = '<img class="tree" src="./img/tree.svg"/>'
                aBox.appendChild(point)
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
    const loadMapsTest = ()=>{
        mapData ={
            "path":"img/maps/1",
            "list":10,
            "attractions":[        
                {"name":"彭家宗祠(起點)","intro":"", "pic":"1.jpg" ,"step":3, "x":40, "y":30},
                {"name":"彭家宗祠(終點)","intro":"", "pic":"1.jpg" ,"step":3, "x":40, "y":30},
                {"name":"一等香麵食館","intro":"一等香麵食館三十年老店、傳承二代本店位於北埔鄉公所旁，在地經營多年，保留傳統客家口味、客家粄條、湯圓。", "pic":"30/01.jpg" ,"step":1, "x":20, "y":30},
                {"name":"清香麵店","intro":"清香麵店為在地傳承四代飄香八十年的老店，不僅販賣客家傳統美食，店內也有販售客家風味的特製佐料、醃製品可以供遊客帶回品嚐。", "pic":"30/02.jpg" ,"step":1, "x":30, "y":30},
                {"name":"北埔鄉農會農民直銷站","intro":"北埔鄉農會農民直銷站除了供應當地生產的生鮮蔬果之外，也有販售各式具客家特色農民自製的初級加工品等。", "pic":"30/03.jpg" ,"step":1, "x":40, "y":30},
                {"name":"藍鵲書房","intro":"藍鵲書房為多樣經營的一間在地書局，不只販賣書籍選物也常舉辦各式的講座及工作坊，期許成為社區居民一起閱讀、共同交流的溫暖平台。", "pic":"30/04.jpg" ,"step":1, "x":50, "y":30},
                {"name":"北埔國小","intro":"北埔國小建立於1898年，其中宿舍建築本體為日式木造宿舍，形貌格局具獨特性，為台灣殖民時期建築史的見證者，更被列為國家文化資產保存。", "pic":"30/05.jpg" ,"step":1, "x":60, "y":30},
                {"name":"甘姐胡椒鴨","intro":"甘姐胡椒鴨老闆娘對中藥入菜非常有研究，將上等的中藥材與精心挑選的鴨隻一起烹調，結合客家特色元素料理，呈現出別具風味的特色菜餚。", "pic":"30/06.jpg" ,"step":1, "x":70, "y":30},
                {"name":"木匠手作坊(回程右手邊)","intro":"木匠手作坊重新賦予木材生命，店內有各式各樣的木作造型家具，堅持把木頭獨一無二的紋理呈現出來，希望透過手作的溫度展現木頭的生命力。", "pic":"30/08.jpg" ,"step":1, "x":20, "y":60},
                {"name":"龍鳳饌客家料理","intro":"龍鳳饌客家料理鄰近北埔老街，適合家庭或是團體旅遊的用餐，整體建築有濃厚的客家懷舊風情，店內也有各式的客家特色料理及北埔的特產茶。", "pic":"30/09.jpg" ,"step":1, "x":30, "y":60},
                {"name":"龍興客家土雞農園","intro":"龍興客家土雞農園主打客家湯圓及各式土雞料理，店內環境舒適寬敞，門口也設有停車場，適合假期旅遊期間的用餐餐廳。", "pic":"30/10.jpg" ,"step":1, "x":40, "y":60},
    
                {"name":"五月客家粄條","intro":"五月客家粄條位於新竹峨眉的台三線小巷內，相較於其他餐廳，這一間非常適合一人旅行的小吃店，無論南來北往,很適合在此停留，飽餐一頓。", "pic":"30/11.jpg" ,"step":2, "x":20, "y":30},
                {"name":"馥立橘園(回程右手邊)","intro":"馥立橘園位於峨眉村台三線上，最熱賣的其中兩品種為砂糖橘、佛利蒙，每顆水份糖分充足、粒粒飽滿，也有紅肉柳丁、甜橙、甜檸檬等選擇喔!", "pic":"30/13.jpg" ,"step":2, "x":30, "y":30},
                {"name":"鍾家橘園","intro":"鍾家橘園至今傳承三代，從阿公用心養地，再由老爸接手開始用心種橘，每年1月到3月可以採收橘子，另外12月柳丁採收季也歡迎揪團來採果。", "pic":"30/14.jpg" ,"step":2, "x":40, "y":30},
                {"name":"峨嵋天主教堂","intro":"峨嵋天主教堂設置在小丘上，分前後兩棟，教堂外部是少見的馬賽克拼貼，內容以天主創造天地萬物為主題，因為此堂的堂名為「萬有真原堂」。", "pic":"30/15.jpg" ,"step":2, "x":50, "y":30},
                {"name":"徐耀良茶園","intro":"徐耀良先生不求量、不求快，注重每個細節，遵循祖父製茶口訣「頭水、二香、三外觀」，追求提供給消費者「好入喉、有質感、高品質」的茶。", "pic":"30/16.jpg" ,"step":2, "x":60, "y":30},
                {"name":"峨嵋草莓園(回程右手邊)","intro":"", "pic":"1.jpg" ,"step":3, "x":40, "y":30},
                {"name":"峨眉茶行","intro":"峨眉茶行邁入第四十六年，現由徐家第四代的三兄弟攜手經營，特色是對茶葉價格採公開、透明化，未來將打造親身體驗採收及製茶的完整茶莊。", "pic":"30/18.jpg" ,"step":2, "x":70, "y":30},
                {"name":"鄉村客家菜(去程對向)","intro":"又名為「鄉村土雞城」，除了肉質鮮甜、軟韌適中的放山玉米雞，閹雞料理的幼嫩口感好，客家炒板條與隱藏版醉毛蟹更是饕客大力推薦的菜色。", "pic":"30/19.jpg" ,"step":2, "x":20, "y":60},
                {"name":"貨櫃89咖啡","intro":"貨櫃89咖啡為兩層的或龜屋建築組成，內部的裝潢走繽紛復古路線且空寬敞，前方也有大草皮跟彩虹貨櫃走廊，適合親子或是情侶來打卡拍照。", "pic":"30/20.jpg" ,"step":2, "x":30, "y":60},
                {"name":"綠光水岸咖啡簡餐","intro":"綠光水岸咖啡廳不僅有各式咖啡、簡餐，更是有露天座位區可以搭配美味的餐點，可以一邊欣賞河邊風景一邊享用下午茶渡過悠閒的午後時光。", "pic":"30/21.jpg" ,"step":2, "x":40, "y":60},
                {"name":"樂活SUP立槳俱樂部","intro":"樂活SUP俱樂部提供專業的立槳體驗服務，在不同時段都有可以體驗的立槳行程，有日出、上午及夕陽團，可以看到不同樣貌的峨眉溪風景。", "pic":"30/22.jpg" ,"step":2, "x":50, "y":60},
                {"name":"富興茶葉展售中心","intro":"富興茶葉展售中心延續七十多年的茶香，從以前的產銷班轉型至現在的茶葉展售中心，內有販售各種不同的品種、等級的茶葉及茶焗蛋。", "pic":"30/23.jpg" ,"step":2, "x":60, "y":60},
                {"name":"富興隆聖宮","intro":"富興隆聖宮有上百年的歷史，是當地民的信仰中心，在日治時期因地震建築稍有受損，整修拆下的古物放置在前廣場及富興老茶廠展示。", "pic":"30/24.jpg" ,"step":2, "x":70, "y":60},
    
                {"name":"富興老茶廠","intro":"富興老茶廠早期工廠的機具整體都保存完好，裡面展示了完整的創辦歷程及當時的茶業發展，也展示了部分隆聖宮的牌匾等歷史物件。", "pic":"30/25.jpg" ,"step":3, "x":10, "y":30},
                {"name":"愛君堡咖啡","intro":"位於忠義街上藍色城堡造型的愛君堡咖啡是當地用餐的好去處，在樓下用完餐後可以到二樓逗貓享用下午茶，偶爾會提供零食讓客人跟貓咪玩耍。", "pic":"30/26.jpg" ,"step":3, "x":20, "y":30},
                {"name":"老屋","intro":"新竹峨眉老屋小吃，是位於大埔水庫旁的客家美食料理，除了乾板條及湯圓，梅乾菜滷肉飯更是一大特色，美味佳餚讓人不自覺地一口接著一口。", "pic":"30/27.jpg" ,"step":3, "x":30, "y":30},
                
                {"name":"峨眉湖環湖步道","intro":"峨嵋湖環湖步道主要建於細茅埔大橋兩側湖畔，沿途自然風景優美，提供遊客到此踏青、騎車，此外更設置友善步道、3D彩繪溪流，供遊客拍照。", "pic":"30/29.jpg" ,"step":3, "x":40, "y":30},
                {"name":"勝豐休閒農莊","intro":"勝豐休閒農場提遊艇、小木屋、露營車、木棚架等露營區與多種戶外活動行程，無需擔心天氣影響出遊心情，喜歡露營的新手朋友千萬不要錯過。", "pic":"30/30.jpg" ,"step":3, "x":50, "y":30},
                {"name":"大埔水庫大壩","intro":"大埔水庫為首座臺灣人自行設計與建造之水壩，具有灌溉農業、工業用水與防洪之效益，為方便兩岸民眾來往搭建１０座吊橋，目前僅保留細茅埔吊橋。", "pic":"30/31.jpg" ,"step":3, "x":60, "y":30},
                {"name":"黃金傳說窯烤麵包","intro":"位於峨嵋鄉的「黃金傳說窯烤麵包」12寮店，提供內用餐點，除了窯烤麵包，另有販售窯烤披薩與各式飲品，喜歡窯烤麵包的民眾不妨到此品嘗。", "pic":"30/32.jpg" ,"step":3, "x":70, "y":30},
                {"name":"十二寮天使教堂","intro":"此天主教堂建於1963年，歷經土地更迭，後續成為無人問津廢墟，教堂廊道與內部遍佈植被，讓荒廢的教堂煥然一新，藉機吸引許多部落客前來拍照。", "pic":"30/33.jpg" ,"step":3, "x":80, "y":30},
                {"name":"二泉湖畔咖啡館","intro":"二泉湖畔咖啡館為峨眉熱門IG打卡咖啡廳，建築外觀保留水泥牆原始樣貌，完美融入湖畔與森林景色，讓人彷彿置身大自然的環抱中，清幽雅緻。", "pic":"30/34.jpg" ,"step":3, "x":20, "y":60},
                {"name":"十方禪林-峨嵋道場","intro":"新竹峨眉十方禪林環境清幽、景觀優美，十方禪堂是座具有唐式古風的現代綠建築，外方內圓的禪堂設計，提醒修行者為人處事都要圓融有原則。", "pic":"30/37.jpg" ,"step":3, "x":30, "y":60},
                {"name":"佳德花卉農場","intro":"峨眉湖畔附近的佳德花卉農場，是較少見的綜合性農場，農場有柑橘、柚子，並有以蘭花為主、品種多樣性的溫室花屋，期望四季都有開花盛況。", "pic":"30/38.jpg" ,"step":3, "x":40, "y":60},
                {"name":"北埔夜市","intro":"位於北埔福聖宮裡的廟口夜市，是在地人生活圈的一環，每日傍晚後都有固定店家擺攤，如同「晚市」，已成為北埔人生活中不可或缺的一部分。", "pic":"30/39.jpg" ,"step":3, "x":50, "y":60}
            ],
            "sounds":[        
                {"step": "1", "mp3": "downhill", "txt": "前面是下坡 請小心騎乘"},
                {"step":"8","mp3":"uphill", "txt":"前面是上坡，請加油"},
                {"step":"10","mp3":"beforeGoal" ,"txt":"快要到終點了，再努力一下"}
            ]
        }
        setMapStep(1)
        setBump(1)
        setTestMapTool()
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
    //loadMaps()
    loadMapsTest() //測試用
})