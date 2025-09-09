const form = document.getElementById("form");
const lista = document.getElementById("lista");
const formTitle = document.getElementById("form-title");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const filePreview = document.getElementById("filePreview");
const imagenPerfilInput = document.getElementById("imagenPerfil");

let editingUserId = null;

// Preview de imagen
imagenPerfilInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      filePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  } else {
    filePreview.innerHTML = "";
  }
});

// CREAR/ACTUALIZAR
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const data = new FormData(form);
    const baseUrl = window.location.origin;
    const url = editingUserId
      ? `${baseUrl}/api/usuarios/${editingUserId}`
      : `${baseUrl}/api/registro`;
    const method = editingUserId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      body: data,
    });

    if (response.ok) {
      const result = await response.json();
      showMessage(
        "success",
        editingUserId
          ? "Usuario actualizado correctamente"
          : "Usuario creado correctamente"
      );
      form.reset();
      filePreview.innerHTML = "";
      cancelEdit();
      cargar();
    } else {
      const error = await response.json();
      showMessage("error", error.error || "Error al procesar la solicitud");
    }
  } catch (error) {
    showMessage("error", "Error de conexión");
    console.error("Error:", error);
  }
});

// CANCELAR EDICIÓN
cancelBtn.addEventListener("click", cancelEdit);

function cancelEdit() {
  editingUserId = null;
  formTitle.textContent = "Crear Usuario";
  submitBtn.textContent = "Crear Usuario";
  cancelBtn.style.display = "none";
  form.reset();
  filePreview.innerHTML = "";
  imagenPerfilInput.required = true;
}

// LISTAR
async function cargar() {
  try {
    lista.innerHTML =
      '<tr><td colspan="5" class="loading">Cargando usuarios...</td></tr>';

    const baseUrl = window.location.origin;
    const res = await fetch(`${baseUrl}/api/usuarios`);
    if (!res.ok) {
      throw new Error("Error al cargar usuarios");
    }

    const users = await res.json();
    lista.innerHTML = "";

    if (users.length === 0) {
      lista.innerHTML =
        '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #718096;">No hay usuarios registrados</td></tr>';
      return;
    }

    users.forEach((u) => {
      lista.insertAdjacentHTML(
        "beforeend",
        `
        <tr>
          <td>
            <img src="${u.imagenPerfil}" alt="Foto de perfil" class="profile-img" 
                 onerror="this.src='${window.location.origin}/default-avatar.svg'">
          </td>
          <td>${u.nombre}</td>
          <td>${u.correo}</td>
          <td>${u.edad} años</td>
          <td>
            <div class="action-buttons">
              <button class="btn-edit" onclick="editar('${u._id}')">
                ✏️ Editar
              </button>
              <button class="btn-delete" onclick="eliminar('${u._id}')">
                🗑️ Eliminar
              </button>
            </div>
          </td>
        </tr>`
      );
    });
  } catch (error) {
    lista.innerHTML =
      '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #e53e3e;">Error al cargar usuarios</td></tr>';
    console.error("Error al cargar usuarios:", error);
  }
}

// EDITAR
async function editar(id) {
  try {
    const editBaseUrl = window.location.origin;
    const response = await fetch(`${editBaseUrl}/api/usuarios/${id}`);
    if (!response.ok) {
      throw new Error("Error al cargar usuario");
    }

    const user = await response.json();

    // Llenar el formulario con los datos del usuario
    document.getElementById("nombre").value = user.nombre;
    document.getElementById("correo").value = user.correo;
    document.getElementById("edad").value = user.edad;

    // Mostrar imagen actual
    filePreview.innerHTML = `<img src="${user.imagenPerfil}" alt="Imagen actual">`;

    // Cambiar modo a edición
    editingUserId = id;
    formTitle.textContent = "✏️ Editar Usuario";
    submitBtn.textContent = "Actualizar Usuario";
    cancelBtn.style.display = "inline-block";

    // Hacer que la imagen no sea obligatoria en edición
    imagenPerfilInput.required = false;

    // Scroll al formulario
    document
      .querySelector(".form-section")
      .scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    showMessage("error", "Error al cargar datos del usuario");
    console.error("Error:", error);
  }
}

// ELIMINAR
async function eliminar(id) {
  if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
    return;
  }

  try {
    const baseUrl = window.location.origin;
    const response = await fetch(`${baseUrl}/api/usuarios/${id}`, { method: "DELETE" });

    if (response.ok) {
      showMessage("success", "Usuario eliminado correctamente");
      cargar();
    } else {
      const error = await response.json();
      showMessage("error", error.error || "Error al eliminar usuario");
    }
  } catch (error) {
    showMessage("error", "Error de conexión");
    console.error("Error:", error);
  }
}

// Mostrar mensajes
function showMessage(type, text) {
  // Remover mensaje anterior si existe
  const existingMessage = document.querySelector(".message");
  if (existingMessage) {
    existingMessage.remove();
  }

  const message = document.createElement("div");
  message.className = `message ${type}`;
  message.textContent = text;

  const formSection = document.querySelector(".form-section");
  formSection.insertBefore(message, formSection.firstChild);

  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (message.parentNode) {
      message.remove();
    }
  }, 5000);
}

// Cargar usuarios al iniciar
cargar();
