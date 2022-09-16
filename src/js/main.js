console.log("main")

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
    

    //init
    closeAll()
    document.querySelector(`#user`).style.display = "block"
    setBtnsHandler()
})