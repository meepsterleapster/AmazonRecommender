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
