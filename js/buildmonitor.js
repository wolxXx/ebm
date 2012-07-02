$(function () {

    var changeJobHeights,
        getJobs,
        init,
        render,

        _config = {
            //apiUrl: '/api/json'
            apiUrl:'example.json'
        },

        $jobs = $('#jobs');


    init = function () {

        $.ajaxSetup({
            cache:false
        });

        $(window).bind('resize', changeJobHeights);
        changeJobHeights();

        // fetch data
        getJobs();
    };

    changeJobHeights = function () {
        $jobs.height($(window).height() - parseInt($('body').css('margin-top'), 10) * 2);
    };

    getJobs = function () {

        $.getJSON(_config.apiUrl, {
            pretty:true,
            depth:1
        }, function (response) {

            var jobs = [];
            $.each(response.jobs, function (index, job) {
                jobs.push(new Job(job));
            });

            render(jobs);
        });
    };

    render = function (jobs) {

        var jobsHeight = parseInt($jobs.height(), 10),
            jobHeight = Math.floor(jobsHeight / jobs.length) - 2;

        $.each(jobs, function (index, job) {

            var $jobNode = job.getNode();
            $jobNode.height(jobHeight);
            $jobs.append($jobNode);
            $jobNode.find('h2').fitText(2.8);
        });


    };


    init();

});
