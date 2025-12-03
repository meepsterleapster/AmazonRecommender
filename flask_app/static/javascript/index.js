async function submit_form(event) {
    event.preventDefault();

    const form = document.getElementById("userForm");
    const formData = new FormData(form);

    const jsonData = Object.fromEntries(formData.entries());

    const response = await fetch("/api/v1/submit_form", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    });

    const result = await response.json();
    document.getElementById("responseMsg").textContent = result.message;
}


async function loadSample() {
    try {
        const response = await fetch('/api/v1/get_samples');
        const json = await response.json();
        console.log(json);
        if (json.status === "success") {
            console.log("loading sample");
            populateItemCards(json.data);
        } else {
            console.error("Failed:", json.message);
        }
    } catch (err) {
        console.error("Error loading item:", err);
    }
}

function getBestImage(images) {
    if (typeof images === "string") {
        try {
            images = JSON.parse(
                images.replace(/'/g, '"') // convert single quotes to double quotes
            );
        } catch (err) {
            console.warn("Failed to parse images:", err);
            return "no-image.png";
        }
    }

    if (!Array.isArray(images) || images.length === 0) {
        return "no-image.png";
    }

    const first = images[0];
    if (first.hi_res && typeof first.hi_res === "string") {
        return first.hi_res;
    }

    for (const img of images) {
        if (img.hi_res) return img.hi_res;
        if (img.large)  return img.large;
        if (img.thumb)  return img.thumb;
    }
    return "no-image.png";
}
const formVotes = {};
function highlightVote(asin, voteType) {
    const thumbsUp = document.getElementById(asin + "_up");
    const thumbsDown = document.getElementById(asin + "_down");

    // Reset both buttons
    thumbsUp.style.opacity = 0.5;
    thumbsDown.style.opacity = 0.5;

    // Highlight the selected button
    if (voteType === "up") {
        thumbsUp.style.opacity = 1;
    } else if (voteType === "down") {
        thumbsDown.style.opacity = 1;
    }
}

function populateItemCards(items) {
    const container = document.getElementById("itemContainer");
    container.innerHTML = "";

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "item-card";

        // Image
        const imgDiv = document.createElement("div");
        imgDiv.className = "item-image";
        const img = document.createElement("img");
        img.src = getBestImage(item.images);
        img.alt = "Item image";
        imgDiv.appendChild(img);
        card.appendChild(imgDiv);

        // Info
        const info = document.createElement("div");
        info.className = "item-info";

        info.innerHTML = `
            <h2 class="item-title">${item.title || "Untitled"}</h2>

            <p class="item-category"><strong>Main Category:</strong> ${item.main_category || "N/A"}</p>

            <p class="item-rating"><strong>Rating:</strong> ${item.average_rating || "N/A"} 
                <span>(${item.rating_number || 0} reviews)</span></p>

            <p class="item-price"><strong>Price:</strong> ${item.price || "N/A"}</p>
            <p class="item-store"><strong>Store:</strong> ${item.store || "N/A"}</p>
            <p class="item-categories"><strong>Categories:</strong> ${item.categories || "N/A"}</p>
            <p class="item-parent"><strong>Parent ASIN:</strong> ${item.parent_asin || "N/A"}</p>
        `;
        card.appendChild(info);

        // 👍 / 👎 Buttons
        const buttonDiv = document.createElement("div");
        buttonDiv.className = "item-buttons";

        const thumbsUp = document.createElement("button");
        thumbsUp.id = item.parent_asin + "_up";
        thumbsUp.textContent = "👍";
        thumbsUp.dataset.asin = item.parent_asin;
        thumbsUp.addEventListener("click", () => {
            formVotes[item.parent_asin] = "up";   // store in form object
            console.log("Thumbs Up:", item.parent_asin, formVotes);
            highlightVote(item.parent_asin, "up"); // optional visual feedback
        });

        const thumbsDown = document.createElement("button");
        thumbsDown.id = item.parent_asin + "_down";
        thumbsDown.textContent = "👎";
        thumbsDown.dataset.asin = item.parent_asin;
        thumbsDown.addEventListener("click", () => {
            formVotes[item.parent_asin] = "down"; // store in form object
            console.log("Thumbs Down:", item.parent_asin, formVotes);
            highlightVote(item.parent_asin, "down"); // optional visual feedback
        });

        buttonDiv.appendChild(thumbsUp);
        buttonDiv.appendChild(thumbsDown);
        card.appendChild(buttonDiv);

        container.appendChild(card);
    });
}
