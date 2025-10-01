let inventario = JSON.parse(localStorage.getItem("inventario")) || [];

const form = document.getElementById("formBody");
const lista = document.getElementById("lista");
const searchInput = document.getElementById("search");
const addButton = document.getElementById("addButton");

form.style.display = "none";

// --- Toast ---
function showToast(msg){
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
  document.getElementById("toast-container").appendChild(toast);
  setTimeout(()=>toast.remove(),3000);
}

// --- Botón flotante ---
addButton.addEventListener("click", ()=> {
  form.style.display = form.style.display==="none"?"flex":"none";
  if(form.style.display==="flex") form.scrollIntoView({behavior:"smooth"});
});

// --- Guardar inventario ---
function guardarInventario(){ localStorage.setItem("inventario",JSON.stringify(inventario)); }

// --- Mostrar inventario ---
function mostrarInventario(filtro=null){
  lista.innerHTML="";
  inventario.forEach((body,index)=>{
    if(filtro==="disponibles" && body.cantidad===0) return;
    if(filtro==="agotados" && body.cantidad>0) return;

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
  });
}

// --- Agregar ---
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

// --- Editar ---
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

// --- Agotado ---
function marcarAgotado(index){
  inventario[index].cantidad=0;
  guardarInventario();
  mostrarInventario();
  showToast("Body marcado como Agotado ❌");
}

// --- Eliminar ---
function eliminarBody(index){
  inventario.splice(index,1);
  guardarInventario();
  mostrarInventario();
  showToast("Body eliminado 🗑️");
}

// --- Búsqueda ---
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

// --- Sidebar filtros ---
function mostrarTodo(){ mostrarInventario(); }
function filtrarDisponibles(){ mostrarInventario("disponibles"); }
function filtrarAgotados(){ mostrarInventario("agotados"); }

// --- Inicializar ---
mostrarInventario();
