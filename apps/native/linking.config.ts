const prefixes = ['https://motiion.io', 'motiion://', 'motiion-dev://']

const linking = {
  prefixes,
  config: {
    screens: {
      app: {
        path: 'app',
        screens: {
          onboarding: {
            path: 'onboarding',
            screens: {
              index: '',
              complete: 'complete',
              profile: {
                path: 'profile',
                screens: {
                  '[step]': ':step',
                },
              },
              attributes: {
                path: 'attributes',
                screens: {
                  '[step]': ':step',
                },
              },
              'work-details': {
                path: 'work-details',
                screens: {
                  '[step]': ':step',
                },
              },
              experiences: {
                path: 'experiences',
                screens: {
                  '[step]': ':step',
                },
              },
              review: {
                path: 'review',
                screens: {
                  index: '',
                  general: 'general',
                  experiences: 'experiences',
                  experience: {
                    path: 'experience',
                    screens: {
                      '[id]': ':id',
                    },
                  },
                  training: {
                    path: 'training',
                    screens: {
                      '[id]': ':id',
                    },
                  },
                },
              },
            },
          },
          '(modals)': {
            path: '',
            screens: {
              onboarding: {
                path: 'onboarding',
                screens: {
                  review: {
                    path: 'review',
                    screens: {
                      '[step]': ':step',
                      experience: {
                        path: 'experience',
                        screens: {
                          '[id]': ':id',
                        },
                      },
                      training: {
                        path: 'training',
                        screens: {
                          '[id]': ':id',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const

export default linking
