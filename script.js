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
  document.getElementById("main-content").style.transform = sidebar.classList.contains("show")?"translateX(220px)":"translateX(0)";
});

overlay.addEventListener("click", ()=>{
  sidebar.classList.remove("show");
  overlay.classList.remove("show");
  document.getElementById("main-content").style.transform="translateX(0)";
});

// Tema oscuro automático según hora
const hour = new Date().getHours();
if(hour>=19 || hour<=6){ document.body.classList.add("dark"); }

themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
});

// Modal imagen
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImg");
const captionText = document.getElementById("caption");
const closeModal = document.getElementById("closeModal");

function abrirImagen(src, nombre) {
  modal.style.display = "block";
  modalImg.src = src;
  captionText.innerText = nombre;
}

closeModal.onclick = function() { modal.style.display = "none"; }
modal.onclick = function(e) { if(e.target===modal) modal.style.display="none"; }

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

// Estadísticas rápidas con barras de progreso
function actualizarStats() {
  // Sumatoria total de stock
  const totalStock = inventario.reduce((acc, b) => acc + b.cantidad, 0);
  
  // Número de bodys disponibles y agotados
  const disponibles = inventario.filter(b=>b.cantidad>0).length;
  const agotados = inventario.filter(b=>b.cantidad===0).length;

  // Actualizar valores en HTML
  document.getElementById("totalBodies").innerText = totalStock;
  document.getElementById("availableBodies").innerText = disponibles;
  document.getElementById("soldOutBodies").innerText = agotados;

  // Calcular porcentaje para barras (total siempre 100%)
  const totalFill = totalStock > 0 ? 100 : 0;
  const availableFill = inventario.length>0 ? (disponibles / inventario.length) * 100 : 0;
  const soldOutFill = inventario.length>0 ? (agotados / inventario.length) * 100 : 0;

  document.getElementById("totalProgress").style.width = totalFill + "%";
  document.getElementById("availableProgress").style.width = availableFill + "%";
  document.getElementById("soldOutProgress").style.width = soldOutFill + "%";
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
    actualizarStats();
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
  actualizarStats();
  showToast("Body editado ✏️");
}

// Agotado
function marcarAgotado(index){
  inventario[index].cantidad=0;
  guardarInventario();
  mostrarInventario();
  actualizarStats();
  showToast("Body marcado como Agotado ❌");
}

// Eliminar
function eliminarBody(index){
  inventario.splice(index,1);
  guardarInventario();
  mostrarInventario();
  actualizarStats();
  showToast("Body eliminado 🗑️");
}

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
      <img src="${body.foto}" alt="Foto del body" onclick="abrirImagen('${body.foto}','${body.nombre}')">
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
        <img src="${body.foto}" alt="Foto del body" onclick="abrirImagen('${body.foto}','${body.nombre}')">
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
function mostrarTodo(){ mostrarInventario(); actualizarStats(); sidebar.classList.remove("show"); overlay.classList.remove("show"); document.getElementById("main-content").style.transform="translateX(0)"; }
function filtrarDisponibles(){ mostrarInventario("disponibles"); actualizarStats(); sidebar.classList.remove("show"); overlay.classList.remove("show"); document.getElementById("main-content").style.transform="translateX(0)"; }
function filtrarAgotados(){ mostrarInventario("agotados"); actualizarStats(); sidebar.classList.remove("show"); overlay.classList.remove("show"); document.getElementById("main-content").style.transform="translateX(0)"; }

// Inicializar
mostrarInventario();
actualizarStats();
