module.exports = {
    validIdLength: [12, 24],
    dbError: {
        status: 500,
        error: 'Internal db error occured'
    },
    projectIdError: {
        status: 400,
        error: 'Invalid Project Id'
    },
    bidtIdError: {
        status: 400,
        error: 'Invalid Bid Id'
    },
    projectNotFound: {
        status: 404,
        error: 'Project record not found'
    },
    bidNotFound: {
        status: 404,
        error: 'Bid record not found'
    },
    invalidBidAmount: {
        status: 400,
        error: 'Invalid bid amount. Amount must be a number and greater than zero.'
    },
    highBidAmount: {
        status: 400,
        error: 'Invalid bid amount. Amount must be less than max bid amount.'
    },
    bidDateOver: {
        status: 423,
        error: 'Locked. Bid deadline is over for this project'
    }
}
