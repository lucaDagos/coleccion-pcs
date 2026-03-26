
const STORAGE_KEY = "photocard_collection_v1";

let showOnlyFavorites = false

function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7)
}

function getCards(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  }catch(e){
    console.error("Error parse storage", e)
    return []
  }
}

function saveCards(cards){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

function render(){
  let cards = getCards()
  if(showOnlyFavorites){
    cards = cards.filter(c => c.favorite)
  }
  const container = document.getElementById("cardsContainer")
  const empty = document.getElementById("emptyMsg")
  container.innerHTML = ""
  if(cards.length === 0){ empty.style.display = "block"; return }
  empty.style.display = "none"
  for(const c of cards){
    const el = document.createElement("div")
    el.className = "card"
    el.innerHTML = `
      <img src="${c.image || 'https://via.placeholder.com/150?text=photocard'}" alt="img" onerror="this.src='https://via.placeholder.com/150?text=photocard'"/>
      <div class="meta">
        <h3>${escapeHtml(c.title)}</h3>
        <p>${escapeHtml(c.member || '')}</p>
        <div class="card-actions">
          <button class="small-btn" onclick="toggleFavorite('${c.id}')">
            ${c.favorite ? "⭐" : "☆"}
          </button>
          <button class="small-btn" onclick="deleteCard('${c.id}')">
            Eliminar
          </button>
        </div>
      </div>
    `
    container.appendChild(el)
  }
}

function addCard(title, member, image){
  //trae las cards guardadas
  const cards = getCards()
  //crea una nueva
  const newCard = { id: uid(), title: title.trim(), member: member.trim(), image: image.trim(), favorite: false }
  //la agrega al inicio
  cards.unshift(newCard)
  //la guarda
  saveCards(cards)
  //vuelve a dibujar la pantalla
  render()
}

function deleteCard(id){
  const cards = getCards().filter(c => c.id !== id)
  saveCards(cards)
  render()
}

function toggleFavorite(id){
  const cards = getCards()

  const updated = cards.map(card=>{
    if(card.id === id){
      return {...card, favorite: !card.favorite}
    }
    return card
  })

  saveCards(updated)
  render()
}

function clearAll(){
  if(!confirm("¿Borrar TODA la colección? Esto no se puede deshacer.")) return
  localStorage.removeItem(STORAGE_KEY)
  render()
}

// small utility to avoid injection when rendering
function escapeHtml(str){
  if(!str) return ""
  return str.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#39;")
}

// init

// cuando la pagina cargue
document.addEventListener("DOMContentLoaded", ()=>{
  
  render()
  
  // busca el formulario
  const form = document.getElementById("cardForm")
  
  // cuando alguien lo envie
  form.addEventListener("submit", (e)=>{
    
    // evita que se recargue la pagina
    e.preventDefault()
    
    // agarra los datos
    const title = document.getElementById("title").value
    const member = document.getElementById("member").value
    const image = document.getElementById("image").value
    if(!title.trim()){ alert("El título es obligatorio"); return }
    
    alert("Agregando nueva photocard!")

    // crea una nueva card
    addCard(title, member, image)
    
    // limpia el formulario
    form.reset()

  })
  
  // si hace click en "borrar todo", se hace clearAll ("borrar todo" tiene como Id "clearStorage")
  document.getElementById("clearStorage").addEventListener("click", clearAll)

  // opcion para mostrar solo los favoritos
  document.getElementById("filterFav").addEventListener("click", ()=>{
    showOnlyFavorites = !showOnlyFavorites
    render()
  })

})