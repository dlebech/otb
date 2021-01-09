# OTB

![build status](https://github.com/dlebech/otb/workflows/Node.js%20CI/badge.svg)

OTB is an app that can parse a list of bank transactions, automatically categorize them
and visualize expenses and incomes over time.

There are many commercial apps for personal finance that can keep track of expenses and incomes.
However, they all store the transactional data in the cloud somewhere, and probably use it to
improve their machine learning algorithms to provide a better service and thus keep users coming back.
This is very handy and convenient, but it might also concern you to hand over your bank data like this.

OTB does all its analysis in the browser only. The advantage of this is that privacy is ensured
by design, since the data never leaves the browser. The app also does not track usage or actions in the app.

In fact, if you decide to use the version of OTB that is hosted on
[otb.hirobo.dev](https://otb.hirobo.dev) (The site is on Netlify), I have no idea
if you are even using the service or not, since I do not track visits on the server.

## Development

Running it locally should be something like this:

```
yarn install
yarn start:lambda
yarn start
```

## The name OTB

If you go through the commit history, you will see that the app used to be called Off The Books.
This was both a long name and a bit shady sounding, so I simply renamed it to OTB
and put it on my `hirobo.dev` domain for now :-)
