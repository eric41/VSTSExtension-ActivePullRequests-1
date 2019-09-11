import { VssPullRequests } from "./vss-pull-requests.service";
declare var sorttable: any;

const prClient = new VssPullRequests();
prClient.getPullRequests().then(PRs => {
    // Build the table
    const tableHeader = document.getElementById("pr-header");
    tableHeader.innerText += " (" + PRs.length + " pull request" + (PRs.length === 1 ? "" : "s") + ")";
    const tableBody = document.getElementById("pr-body");
    console.log("*** pull request data ***", PRs);
    PRs.forEach(PR => {
        const repoUrl = PR.baseUri + encodeURIComponent(PR.projectName) + "/_git/" + encodeURIComponent(PR.repo);
        const tableRow = document.createElement("tr");
        tableRow.classList.add("table-row");
        // User Avatar cell
        const tableCellUserAvatar = document.createElement("td");
        tableCellUserAvatar.innerHTML = "<img class='user-avatar' src='" + PR.createdBy.imageUrl + "' alt='" + PR.createdBy.uniqueName + "\'s avatar' />";
        tableRow.appendChild(tableCellUserAvatar);
        // Created By cell
        const tableCellUser = document.createElement("td");
        tableCellUser.innerText = PR.createdBy.displayName;
        tableRow.appendChild(tableCellUser);
        // Creation Date cell
        const tableCellCreationDate = document.createElement("td");
        const age = Math.floor((Date.now() - PR.creationDate.getTime()) / 36e5 * 10) / 10;
        tableCellCreationDate.setAttribute("sorttable_customkey", "" + age);
        if (age >= 24) {
            tableCellCreationDate.classList.add("u-danger");
        }
        tableCellCreationDate.innerText = `${age} ${ age > 1 ? "hours" : "hour"}`;
        tableRow.appendChild(tableCellCreationDate);

        // Pull Request ID cell
        const tableCellId = document.createElement("td");
        tableCellId.setAttribute("sorttable_customkey", "" + PR.id);
        tableCellId.innerHTML = "<a href='" + repoUrl + "/pullRequest/" + PR.id + "' target='_top'>#" + PR.id + "</a>";
        tableRow.appendChild(tableCellId);
        // Title cell
        const tableCellTitle = document.createElement("td");
        if (PR.isDraft) {
            tableCellTitle.classList.add("u-danger");
        }
        tableCellTitle.innerText = `${PR.isDraft ? "[DRAFT]" : ""} ${PR.title}`;
        tableRow.appendChild(tableCellTitle);
        // Repository cell
        const tableCellRepo = document.createElement("td");
        tableCellRepo.innerText = PR.repo;
        tableRow.appendChild(tableCellRepo);
        // Base cell -- Don't need it
        // const tableCellBaseBranch = document.createElement("td");
        // tableCellBaseBranch.innerHTML = `<a href="${repoUrl}?version=GB${encodeURIComponent(PR.baseBranch)}" target="_top"><span class="bowtie-icon bowtie-tfvc-branch"></span>${PR.baseBranch}</a>`;
        // tableRow.appendChild(tableCellBaseBranch);
        // Target cell -- Don't need it
        // const tableCellTargetBranch = document.createElement("td");
        // tableCellTargetBranch.innerHTML = `<a href="${repoUrl}?version=GB${encodeURIComponent(PR.targetBranch)}" target="_top"><span class="bowtie-icon bowtie-tfvc-branch"></span>${PR.targetBranch}</a>`;
        // tableRow.appendChild(tableCellTargetBranch);
        // Build Status cell -- Don't need it
        // const tableCellBuildStatus = document.createElement("td");
        // const buildDisplay = prClient.buildStatusToBuildDisplay(prBuild.build);
        // tableCellBuildStatus.setAttribute("sorttable_customkey", (prBuild.build != null ? prBuild.build.status : 0).toString());
        // tableCellBuildStatus.innerHTML = (buildDisplay.icon != null ? `<span class="icon bowtie-icon bowtie-${buildDisplay.icon}"></span> ` : "") + buildDisplay.message;
        // tableCellBuildStatus.style.color = buildDisplay.color != null ? buildDisplay.color : "#808080";
        // tableRow.appendChild(tableCellBuildStatus);
        // My Vote cell
        const tableCellVote = document.createElement("td");
        tableCellVote.setAttribute("sorttable_customkey", "" + PR.vote);
        const vote = prClient.voteNumberToVote(PR.vote);
        tableCellVote.innerHTML = vote.icon + " " + vote.message;
        if (vote.color !== undefined) {
            tableCellVote.style.color = vote.color;
        }
        tableRow.appendChild(tableCellVote);
        // Reviewers cell
        const tableCellReviewers = document.createElement("td");
        tableCellReviewers.classList.add("reviewers-cell");
        tableCellReviewers.setAttribute("sorttable_customkey", "" + PR.reviewers.length);
        PR.reviewers.map(x => {
            return { vote: prClient.voteNumberToVote(x.vote), reviewer: x };
        }).sort(x => x.vote.order).forEach(reviewerVote => {
            const reviewerElement = document.createElement("span");
            reviewerElement.classList.add("reviewer-icon");
            reviewerElement.innerHTML += `<img class="user-avatar" src="${reviewerVote.reviewer.imageUrl}" alt="${reviewerVote.reviewer.uniqueName}'s avatar" />`;
            reviewerElement.innerHTML += "<div class='vote-icon'>" + reviewerVote.vote.icon + "</div>";
            tableCellReviewers.appendChild(reviewerElement);
        });
        tableRow.appendChild(tableCellReviewers);
        tableBody.appendChild(tableRow);
    });
}).then(() => sorttable.makeSortable(document.getElementById("pr-table"))).then(() => {
    const prIdHeader = document.getElementsByClassName("pr-id-header")[0];
    sorttable.innerSortFunction.apply(prIdHeader, []);
    document.getElementById("pr-body").classList.remove("loading");
    document.getElementById("pr-body").classList.add("loaded");
});
