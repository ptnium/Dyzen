// If the script does not work, you may need to allow same site scripting https://stackoverflow.com/a/50902950

Facebook = {
    config: {
        actionDelay: 1000,
        scrollDelay: 5000,
        // set to -1 for no limit
        maxRequestsToAccept: -1,
        totalRequestsAccepted: 0,
        // set string to be present in names to be accepted, leave empty to accept all
        mustIncludeInName: [],
    },
    inspect: function (data, config) {
        console.info("INFO: script initialized on the page data...");
        console.debug("DEBUG: finding confirm buttons...");
        var confirmDivEles = document.querySelectorAll('[aria-label="Confirm"]');
        data = [];

        for (var i = 0; i < confirmDivEles.length; i++) {
            if (confirmDivEles[i].getAttribute("aria-disabled") == null && confirmDivEles[i].innerText.includes("Confirm")) {
                data.push(confirmDivEles[i]);
            }
        }
        var totalRows = data.length; 
        console.debug("DEBUG: total confirm buttons found on page are " + totalRows);
        if (totalRows > 0) {
            this.confirm(data, config);
        } else {
            console.warn("INFO: end of friend requests!");
            this.complete(config);
        }
    },
    confirm: function(data, config) {
        if (data.length === 0){
            console.info("INFO: Current friend request list exhausted! Scrolling for more...");
            console.debug("DEBUG: scrolling to bottom in " + config.actionDelay + " ms");
            setTimeout(() => this.scrollBottom(data, config), config.actionDelay);
        } else {
            var friendRequest = data.shift();
            try {
                var friendRequestName = friendRequest.parentElement.parentElement.parentElement.parentElement.parentElement.textContent.toLowerCase().split(" ")[0];

                if (config.mustIncludeInName.length <= 0 || config.mustIncludeInName.some(x => friendRequestName.match(x.toLowerCase()))) {
                    friendRequest.click();
                    config.totalRequestsAccepted += 1;
                    config.maxRequestsToAccept -= 1;
                    if (config.maxRequestsToAccept === 0) {
                        this.complete(config);
                    } else {
                        console.info("INFO: " + config.totalRequestsAccepted + " friend requests accepted!");
                        console.debug("DEBUG: Accepting next friend request in " + config.actionDelay);
                        setTimeout(() => this.confirm(data, config), config.actionDelay);
                    }
                } else {
                    console.debug("DEBUG: Ignoring friend request from " + friendRequestName);
                    console.debug("DEBUG: Accepting next friend request in " + config.actionDelay);
                    setTimeout(() => this.confirm(data, config), config.actionDelay);
                }
            } catch (e) {
                console.debug("DEBUG: Accepting next friend request in " + config.actionDelay);
                setTimeout(() => this.confirm(data, config), config.actionDelay);
            }
            
        }
    },
    scrollBottom: function (data, config) {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        console.debug("DEBUG: waiting for scroll data to load, then finding buttons in " + config.scrollDelay + " ms");
        setTimeout(() => this.inspect(data, config), config.scrollDelay);
    },
    complete: function (config) {
        console.info('INFO: script completed after accepting ' + config.totalRequestsAccepted + ' friend requests');
    }
}

Facebook.inspect([], Facebook.config);
