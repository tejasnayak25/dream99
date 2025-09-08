let addBtn = document.getElementById("add-btn");
let addIcon = addBtn.querySelector("i");
let companyMenuHolder = document.getElementById("company-menu-holder");
let companyMenu = companyMenuHolder.querySelector("#company-menu");
let companySearch = companyMenuHolder.querySelector("#company-search");
let favourites = document.getElementById("favourites");

let companies = [];

addBtn.onclick = () => {
    if(addIcon.classList.contains("rotate-45")) {
        addIcon.classList.remove("rotate-45");
        companyMenuHolder.style.marginBottom = "-200px";
        companyMenuHolder.style.opacity = 0;
        setTimeout(() => {
            companyMenuHolder.classList.add("hidden");
        }, 0);
    } else {
        addIcon.classList.add("rotate-45");
        companyMenuHolder.classList.remove("hidden");
        setTimeout(() => {
            companyMenuHolder.style.opacity = 1;
            companyMenuHolder.style.marginBottom = "0px";
        }, 0);
    }
}

let browserid = localStorage.getItem("browserid");
if(!browserid) {
    browserid = Math.random().toString(36).substring(2, 15);
    localStorage.setItem("browserid", browserid);
}

fetch(`/api/user/${browserid}/companies`)
.then(res => res.json())
.then((res) => {
    res.companies.forEach(c => {
        addCompany(c);
    });
});

function addCompany(c) {
    let div2 = document.createElement("div");
    div2.className = "flex shrink-0 rounded-md bg-slate-100 overflow-hidden items-center hover:bg-blue-200 cursor-pointer transition-all";
    div2.innerHTML = `
        <img src="${c.logo}" class="w-14 h-14 aspect-square object-cover bg-blue-400 "></img>
        <p data-name="${c.name}" class="px-5 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">${c.name}</p>
        <div class="w-14 h-14 aspect-square flex justify-center items-center">
            <i id="delete-btn" class="fi fi-br-trash text-red-400 text-xl cursor-pointer active:scale-95 transition-all"></i>
        </div>
    `;
    div2.querySelector("#delete-btn").onclick = () => {
        fetch(`/api/user/${browserid}/companies/${c.name}`, {
            method: "DELETE"
        }).then((res) => {
            div2.remove();
        });
    }
    favourites.append(div2);
}

fetch("/api/companies")
.then(res => res.json())
.then((res) => {
    companies = res;
    companyMenu.innerHTML = "";

    companies.forEach(c => {
        let div = document.createElement("div");
        div.className = "flex shrink-0 rounded-md bg-slate-100 overflow-hidden items-center hover:bg-blue-200 cursor-pointer transition-all";
        div.innerHTML = `
            <img src="${c.logo}" class="w-12 h-12 aspect-square object-cover rounded-md bg-blue-400 "></img>
            <p class="px-5 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">${c.name}</p>
        `;
        companyMenu.append(div);

        div.ondblclick = () => {
            if(favourites.children.length >= 20) {
                alert("Can't add more than 20 companies!");
                return;
            }
            if(favourites.querySelector(`p[data-name="${c.name}"]`)) {
                alert("Company is already in your list!");
                return;
            }
            addCompany(c);
            fetch(`/api/user/${browserid}/companies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ c })
            });
        }
    });

    companySearch.oninput = () => {
        let query = companySearch.value.toLowerCase();
        for(let i of companyMenu.children) {
            let text = i.querySelector("p").innerText.toLowerCase();
            if(text.startsWith(query)) {
                i.classList.replace("hidden", "flex");
            } else {
                i.classList.replace("flex", "hidden");
            }
        }
    }
});