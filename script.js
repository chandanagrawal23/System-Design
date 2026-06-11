const cards = document.querySelectorAll(".card");

cards.forEach((card, index) =>
{
card.animate(
[
{
opacity: 0,
transform: "translateY(20px)"
},
{
opacity: 1,
transform: "translateY(0)"
}
],
{
duration: 400,
delay: index * 80,
fill: "forwards"
});
});
