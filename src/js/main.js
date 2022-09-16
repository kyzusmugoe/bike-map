console.log("main")


let runnerList = [];//追蹤的跑者清單

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
                document.querySelector(`#${event.target.dataset.id}`).style.display = "block"
            })
        })
    }
    
    const runnerAddHandler = ()=>{
        let runnerList = [];
        const boxUser = document.querySelector("#runnerBox")//user頁面
        const boxSuggest = document.querySelector("#myRunnerList")//user頁面
        const runnerName = document.querySelector("#runnerName")
        
        renderRunner = box =>{
            while(box.firstChild){
                box.removeChild(box.lastChild)
            }    
            runnerList.map(name=>{
                let member = document.createElement("div")
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
    

    //init
    closeAll()
    document.querySelector(`#user`).style.display = "block"
    setBtnsHandler()
    runnerAddHandler()
})