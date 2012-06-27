var Job = function (data) {

	var calculateBuildPercentage,
		calculateRemainingBuildTime,
		calculateRuntime,
		displayBuildProgress,
		displayCulprits,
		displayVcsInformation,
		fetchRemainingBuildTime,
		formatSeconds,
		getBuildStateClassByColor,
		getBuildStateClassByState,
		getNode,
		isBuildSuccess,
		trimText,

		_apiUrl = data.url + 'lastBuild/api/json',
		_building,
		_culpritTemplate = '<div class="culprits"><h3>The usual suspects:</h3><ul></ul></div>',
		_jobTemplate = '<div><h2></h2></div>',
		_vcsInfoTemplate = '<div class="vcs-info"><ul></ul></div>',
		_pollingTimerBuilding = 1000,
		_pollingTimerNotBuilding = 5000,
		_trimTextLength = 80,

		$job = $(_jobTemplate);


	getBuildStateClassByColor = function (color) {
		return color === 'blue' ? 'success' : 'failed';
	};

	getBuildStateClassByState = function (state) {
		return state ? 'success' : 'failed';
	};

	getNode = function () {

		$job.addClass('job')
			.addClass(getBuildStateClassByColor(data.color));
		$job.find('h2').text(data.displayName);

		fetchRemainingBuildTime();

		return $job;
	};

	fetchRemainingBuildTime = function () {

		var building = false;
		$.getJSON(_apiUrl, function (response) {

			$job.find('.build-progress').remove();
			if (_building === false) {
				$job.removeClass('building');
				_building = false;
			}

			if (response.building) {

				$job.toggleClass('building');

				displayBuildProgress(response);

				_building = true;
				window.setTimeout(fetchRemainingBuildTime, _pollingTimerBuilding);

			} else {

				var buildState = isBuildSuccess(response.result);
				if (!buildState) {
					displayCulprits(response.culprits);
					displayVcsInformation(response.changeSet);
				}

				$job.removeClass('failed').removeClass('success').addClass(getBuildStateClassByState(buildState));

				_building = false;
				window.setTimeout(fetchRemainingBuildTime, _pollingTimerNotBuilding);
			}
		});
	};

	calculateRemainingBuildTime = function (estimatedDuration, runtime) {
		return estimatedDuration - runtime;
	};

	calculateBuildPercentage = function (estimatedDuration, runtime) {
		return Math.floor(runtime / estimatedDuration * 100);
	};

	calculateRuntime = function (buildStart) {
		return new Date().getTime() - buildStart;
	};

	formatSeconds = function (remainingMilliseconds) {
		var remainingSeconds = Math.floor(remainingMilliseconds / 1000),
			hours = Math.floor(remainingSeconds / 3600),
			minutes = Math.floor(remainingSeconds % 3600 / 60),
			seconds = remainingSeconds % 3600 % 60,
			output = [
				seconds + 's'
			];

		if (minutes) {
			output.push(minutes + 'm');
		}
		if (hours) {
			output.push(hours + 'h');
		}

		return output.reverse().join('');
	};

	displayBuildProgress = function (response) {
		var runtime = calculateRuntime(response.timestamp),
			remainingMilliseconds = calculateRemainingBuildTime(response.estimatedDuration, runtime),
			$duration = $('<p></p>').addClass('build-progress');

		$duration.text(formatSeconds(remainingMilliseconds) + ' / ' +
			calculateBuildPercentage(response.estimatedDuration, runtime) + '%');

		$job.find('h2').after($duration);
	};

	displayCulprits = function (culprits) {

		$job.find('.culprits').remove();

		if (culprits.length) {
			var $culprits = $(_culpritTemplate);
			$.each(culprits, function (index, culprit) {
				$culprits.find('ul').append($('<li></li>').text(culprit.fullName));
			});
			$job.find('h2').after($culprits);
		}
	};

	displayVcsInformation = function (changeSet) {

		$job.find('.vcs-info').remove();

		if (changeSet.items.length) {
			var $vcsInfo = $(_vcsInfoTemplate);
			$.each(changeSet.items.slice(0, 2), function (index, vcsInfo) {
				$vcsInfo.find('ul').append($('<li></li>').html(vcsInfo.revision + ' [' + vcsInfo.user + '] ' +
					trimText(vcsInfo.msg)));
			});
			$job.find('h2').after($vcsInfo);
		}
	};

	isBuildSuccess = function (result) {
		return result === 'SUCCESS';
	};

	trimText = function (text) {
		return text.length > _trimTextLength ? text.substr(0, _trimTextLength - 3) + '...' : text;
	};


	return {
		getNode:getNode
	};
};
