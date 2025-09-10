// Formulario Avanzado

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactoForm");

  // Validación en tiempo real
  form.querySelectorAll("input, select, textarea").forEach(input => {
    input.addEventListener("input", () => validarCampo(input));
  });

  function validarCampo(input) {
    if (input.type === "radio" || input.type === "checkbox") {
      const name = input.name;
      const group = form.querySelectorAll(`[name="${name}"]`);
      const algunoMarcado = Array.from(group).some(el => el.checked);
      setEstado(group[0].parentElement, algunoMarcado);
      return algunoMarcado;
    } else {
      const valido = input.checkValidity();
      setEstado(input, valido);
      return valido;
    }
  }

  function setEstado(elemento, valido) {
    if (valido) {
      elemento.classList.remove("error");
      elemento.classList.add("success");
    } else {
      elemento.classList.remove("success");
      elemento.classList.add("error");
    }
  }

  // Envío simulado con Fetch
  form.addEventListener("submit", e => {
    e.preventDefault();

    let valido = true;
    form.querySelectorAll("input, select, textarea").forEach(input => {
      if (!validarCampo(input)) valido = false;
    });

    if (!valido) {
      alert("Por favor, complete correctamente todos los campos.");
      return;
    }

    const datos = new FormData(form);
    const objeto = Object.fromEntries(datos.entries());

    // Para checkboxes, juntar valores
    objeto.intereses = datos.getAll("intereses");

    fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify(objeto),
      headers: { "Content-Type": "application/json" }
    })
      .then(res => res.json())
      .then(data => {
        alert("Formulario enviado con éxito!");
        console.log("Respuesta del servidor:", data);
        form.reset();
      })
      .catch(err => {
        alert("Hubo un error al enviar.");
        console.error(err);
      });
  });
});
