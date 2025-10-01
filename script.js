let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

const form = document.getElementById("formBody");
const lista = document.getElementById("lista");
const searchInput = document.getElementById("search");
const addButton = document.getElementById("addButton");
const themeToggle = document.getElementById("themeToggle");
form.style.display = "none";

// Sidebar toggle
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

menuToggle.addEventListener("click", ()=>{
  sidebar.classList.toggle("show");
  overlay.classList.toggle("show");
  if(sidebar.classList.contains("show")){
    document.getElementById("main-content").style.transform = "translateX(220px)";
  } else {
    document.getElementById("main-content").style.transform = "translateX(0)";
  }
});

overlay.addEventListener("click", ()=>{
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
  document.getElementById("main-content").style.transform = "translateX(0)";
});

// Tema oscuro automático según hora
const hour = new Date().getHours();
if(hour>=19 || hour<=6){ document.body.classList.add("dark"); }

themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
});

// Mostrar inventario
function mostrarInventario(filtro){
  lista.innerHTML = "";
  inventario.forEach((body,index)=>{
    if(filtro==="disponibles" && body.cantidad===0) return;
    if(filtro==="agotados" && body.cantidad>0) return;

    const card = document.createElement("div");
    card.classList.add("card","pop");

    let stockColor="#28a745";
    if(body.cantidad===0) stockColor="#dc3545";
    else if(body.cantidad<=3) stockColor="#ffc107";

    card.innerHTML = `
      <h3>${body.nombre}</h3>
      <p>Color: ${body.color}</p>
      <p>Cantidad: ${body.cantidad}</p>
      ${body.cantidad===0?'<p class="sold-out"><i class="fas fa-times-circle"></i> SOLD OUT</p>':''}
      <img src="${body.foto}" alt="Foto del body">
      <div class="stock-bar"><div class="stock-fill" style="width:${Math.min(body.cantidad*10,100)}%;background:${stockColor}"></div></div>
      <div class="card-buttons">
        <button onclick="editarBodyUI(${index})"><i class="fas fa-edit"></i> Editar</button>
        <button onclick="marcarAgotado(${index})"><i class="fas fa-ban"></i> Agotado</button>
        <button onclick="eliminarBody(${index})"><i class="fas fa-trash"></i> Eliminar</button>
      </div>
    `;
    lista.appendChild(card);
  });
}

// Guardar inventario
function guardarInventario(){ localStorage.setItem("inventario", JSON.stringify(inventario)); }

// Toast
function showToast(msg){
  const toast=document.createElement("div");
  toast.className="toast";
  toast.textContent=msg;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(()=>toast.remove(),3000);
}

// Añadir body
addButton.addEventListener("click", ()=>{
  form.style.display=form.style.display==="none"?"flex":"none";
});

// Form submit
form.addEventListener("submit", e=>{
  e.preventDefault();
  const nombre=document.getElementById("nombre").value;
  const color=document.getElementById("color").value;
  const cantidad=parseInt(document.getElementById("cantidad").value);
  const fotoInput=document.getElementById("foto");
  const reader=new FileReader();
  reader.onload=function(e){
    const foto=e.target.result;
    inventario.push({nombre,color,cantidad,foto});
    guardarInventario();
    mostrarInventario();
    form.reset();
    form.style.display="none";
    showToast("Body agregado ✅");
  };
  reader.readAsDataURL(fotoInput.files[0]);
});

// Editar
function editarBodyUI(index){
  const body=inventario[index];
  const nuevoColor=prompt("Editar color:",body.color);
  if(nuevoColor!==null) body.color=nuevoColor;
  const nuevaCantidad=prompt("Editar cantidad:",body.cantidad);
  if(nuevaCantidad!==null&&!isNaN(nuevaCantidad)) body.cantidad=parseInt(nuevaCantidad);
  guardarInventario();
  mostrarInventario();
  showToast("Body editado ✏️");
}

// Agotado
function marcarAgotado(index){
  inventario[index].cantidad=0;
  guardarInventario();
  mostrarInventario();
  showToast("Body marcado como Agotado ❌");
}

// Eliminar
function eliminarBody(index){
  inventario.splice(index,1);
  guardarInventario();
  mostrarInventario();
  showToast("Body eliminado 🗑️");
}

// Búsqueda
searchInput.addEventListener("input", ()=>{
  const q=searchInput.value.toLowerCase();
  lista.innerHTML="";
  inventario.forEach((body,index)=>{
    if(body.nombre.toLowerCase().includes(q)||body.color.toLowerCase().includes(q)){
      const card=document.createElement("div");
      card.classList.add("card","pop");

      let stockColor="#28a745";
      if(body.cantidad===0) stockColor="#dc3545";
      else if(body.cantidad<=3) stockColor="#ffc107";

      card.innerHTML=`
        <h3>${body.nombre}</h3>
        <p>Color: ${body.color}</p>
        <p>Cantidad: ${body.cantidad}</p>
        ${body.cantidad===0?'<p class="sold-out"><i class="fas fa-times-circle"></i> SOLD OUT</p>':''}
        <img src="${body.foto}" alt="Foto del body">
        <div class="stock-bar"><div class="stock-fill" style="width:${Math.min(body.cantidad*10,100)}%;background:${stockColor}"></div></div>
        <div class="card-buttons">
          <button onclick="editarBodyUI(${index})"><i class="fas fa-edit"></i> Editar</button>
          <button onclick="marcarAgotado(${index})"><i class="fas fa-ban"></i> Agotado</button>
          <button onclick="eliminarBody(${index})"><i class="fas fa-trash"></i> Eliminar</button>
        </div>
      `;
      lista.appendChild(card);
    }
  });
});

// Filtros sidebar
function mostrarTodo(){ mostrarInventario(); sidebar.classList.remove("show"); overlay.classList.remove("show"); document.getElementById("main-content").style.transform="translateX(0)"; }
function filtrarDisponibles(){ mostrarInventario("disponibles"); sidebar.classList.remove("show"); overlay.classList.remove("show"); document.getElementById("main-content").style.transform="translateX(0)"; }
function filtrarAgotados(){ mostrarInventario("agotados"); sidebar.classList.remove("show"); overlay.classList.remove("show"); document.getElementById("main-content").style.transform="translateX(0)"; }

// Inicializar
mostrarInventario();
