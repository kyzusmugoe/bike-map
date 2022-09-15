console.log("main")

const setBtnsHandler = ()=>{
    const pages = document.querySelectorAll(".page") 
    const btns = document.querySelectorAll(".pageBtn") 
    
    const closeAll = ()=>{
        //alert("closeAll")
        pages.forEach(page=>{  
            page.style.display="none"
        })
    }
    

    btns.forEach(btn=>{    
        btn.addEventListener("click", event=>{
            closeAll()
            document.querySelector(`#${event.target.dataset.id}`).style.display="block"
        })
    })
}


document.addEventListener('DOMContentLoaded', ()=>{
    setBtnsHandler()
})

