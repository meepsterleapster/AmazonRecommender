const formVotes = {};

document.getElementById("submitVotesBtn").addEventListener("click", async () => {
    try {
        const response = await fetch("/api/v1/submit_form", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formVotes)
        });

        const result = await response.json();

        if (result.status === "success") {
            console.log("Form submitted:", formVotes);
            let groupsContainer = document.getElementById("groupsContainer");
            groupsContainer.innerHTML = "";
            let submitbutton = document.getElementById("submitVotesBtn");
            submitbutton.style.display = "none";
            let header = document.getElementById("header");
            header.innerText = "Here are some things you might like:";
            loadRecommendations();
        } else {
            console.error("Submission failed:", result.message);
        }
    } catch (err) {
        console.error("Error submitting votes:", err);
    }
});

async function loadSample() {
    try {
        const response = await fetch('/api/v1/get_samples');
        const json = await response.json();
        console.log(json);
        if (json.status === "success") {
            console.log("loading sample");
            populateItemCardsByGroup(json.data);
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
function populateItemCardsByGroup(items) {
    const container = document.getElementById("groupsContainer");
    container.innerHTML = "";

    // Group items by sample_group
    const groups = {};
    items.forEach(item => {
        const group = item.sample_group || "Ungrouped";
        if (!groups[group]) groups[group] = [];
        groups[group].push(item);
    });

    Object.entries(groups).forEach(([groupName, groupItems]) => {
        const groupContainer = document.createElement("div");
        groupContainer.className = "group-container";

        const title = document.createElement("div");
        title.className = "group-title";
        title.textContent = groupName;
        groupContainer.appendChild(title);

        const scrollRow = document.createElement("div");
        scrollRow.className = "scroll-row";

        groupItems.forEach(item => {
            const card = createItemCard(item, recs=false);
            scrollRow.appendChild(card);
        });

        groupContainer.appendChild(scrollRow);
        container.appendChild(groupContainer);
    });
}


function createItemCard(item, recs) {
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
    `;
    card.appendChild(info);
    if (recs) {
        return card; // No buttons for initial sample cards
    }
    // Thumbs buttons
    const buttonDiv = document.createElement("div");
    buttonDiv.className = "item-buttons";

    const thumbsUp = document.createElement("button");
    thumbsUp.id = item.parent_asin + "_up";
    thumbsUp.textContent = "👍";
    thumbsUp.dataset.asin = item.parent_asin;
    thumbsUp.addEventListener("click", () => {
        formVotes[item.parent_asin] = "5";
        highlightVote(item.parent_asin, "up");
    });

    const thumbsDown = document.createElement("button");
    thumbsDown.id = item.parent_asin + "_down";
    thumbsDown.textContent = "👎";
    thumbsDown.dataset.asin = item.parent_asin;
    thumbsDown.addEventListener("click", () => {
        formVotes[item.parent_asin] = "1";
        highlightVote(item.parent_asin, "down");
    });

    buttonDiv.appendChild(thumbsUp);
    buttonDiv.appendChild(thumbsDown);
    card.appendChild(buttonDiv);

    return card;
}

function populateRecommendations(items) {
    const container = document.getElementById("recommendationsContainer");
    container.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "recommendation-grid";

    items.forEach(item => {
        const card = createItemCard(item, recs=true);
        grid.appendChild(card);
    });
    container.appendChild(grid);
}

async function loadRecommendations() {
    recs = document.getElementById('recommendationsContainer')
    try{
        const response = await fetch('/api/v1/get_recs');
        const json = await response.json();
        console.log(json);
        if (json.status === "success") {
            console.log("loading recommendations");
            populateRecommendations(json.data);
        } else {
            console.error("Failed:", json.message);
        }
    } catch (err) {
        recs.innerHTML = "<p>Loading recommendations...</p>";    
        console.error("Error loading item:", err);
    }
}
