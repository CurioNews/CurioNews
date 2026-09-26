const curiosities = [
  {text:"O coração de uma baleia-azul pode pesar mais de 100 kg. É o maior coração do reino animal!", image:"https://images.unsplash.com/photo-1560275619-4662e36fa65c?auto=format&fit=crop&w=700&q=85"},
  {text:"Os polvos possuem três corações e seu sangue é azul por causa da hemocianina.", image:"https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?auto=format&fit=crop&w=700&q=85"},
  {text:"Um raio pode atingir temperaturas cerca de cinco vezes maiores que a superfície do Sol.", image:"https://images.unsplash.com/photo-1461511669078-d46bf351cd6e?auto=format&fit=crop&w=700&q=85"},
  {text:"O mel, quando armazenado corretamente, pode permanecer preservado por milhares de anos.", image:"https://images.unsplash.com/photo-1471943311424-646960669fbc?auto=format&fit=crop&w=700&q=85"}
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  $("#themeToggle").textContent = document.body.classList.contains("dark") ? "☀" : "☾";
  localStorage.setItem("curionews-theme", document.body.classList.contains("dark") ? "dark" : "light");
});
if(localStorage.getItem("curionews-theme")==="dark"){
  document.body.classList.add("dark");
  $("#themeToggle").textContent="☀";
}

$("#menuToggle").addEventListener("click", () => $("#mainNav").classList.toggle("open"));

let curiosityIndex = 0;
$("#newCuriosity").addEventListener("click", () => {
  curiosityIndex = (curiosityIndex + 1) % curiosities.length;
  const c = curiosities[curiosityIndex];
  $("#curiosityText").textContent = c.text;
  $("#curiosityImage").src = c.image;
  showToast("Nova curiosidade carregada!");
});

function filterArticles(filter){
  $$(".article-card").forEach(card => {
    const match = filter === "Todos" || card.dataset.category === filter;
    card.classList.toggle("hidden", !match);
  });
}

$$(".category").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".category").forEach(x => x.classList.remove("selected"));
    btn.classList.add("selected");
    filterArticles(btn.dataset.filter);
    $("#noticias").scrollIntoView({behavior:"smooth", block:"start"});
    showToast(`Mostrando categoria: ${btn.dataset.filter}`);
  });
});

$("#searchInput").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase().trim();
  $$(".article-card").forEach(card => {
    const text = `${card.dataset.title} ${card.dataset.category}`.toLowerCase();
    card.classList.toggle("hidden", term && !text.includes(term));
  });
});

$$(".article-card").forEach(card => {
  card.addEventListener("click", () => {
    const title = card.dataset.title;
    showToast(`Abrindo: ${title}`);
  });
});

function showToast(message){
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(()=>toast.classList.remove("show"), 2600);
}

$$(".nav a").forEach(link => link.addEventListener("click", ()=>$("#mainNav").classList.remove("open")));
