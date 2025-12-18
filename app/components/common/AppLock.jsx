import React from 'react';

const AppLock = () => {
  return (
    <s-section>
      <s-grid
        gap="small-400"
        alignItems="center"
        justifyContent="center"
      >
        <s-box
          padding="large-300"
          borderRadius="large"
          maxInlineSize="400px"
        >
          <s-stack
            alignItems="center"
            gap="base"
            className="app-lock-icon"
          >
            <div style={{ width: "50px" }}>
              <span
                aria-hidden="true"
                className="icon color-base tone-neutral size-base"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                >
                  <path d="M8.75 11.05a1.5 1.5 0 1 0-1.5 0v.45a.75.75 0 0 0 1.5 0z"></path>
                  <path
                    fill-rule="evenodd"
                    d="M4.25 5.095v-.345a3.75 3.75 0 0 1 7.5 0v.345a3 3 0 0 1 2.25 2.905v4a3 3 0 0 1-3 3h-6a3 3 0 0 1-3-3v-4a3 3 0 0 1 2.25-2.905m1.5-.345a2.25 2.25 0 1 1 4.5 0v.25h-4.5zm-2.25 3.25a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5z"
                  ></path>
                </svg>
              </span>
            </div>
            <s-paragraph color="subdued">
              <s-stack alignItems="center">
                <s-text>
                  To unlock advanced features of your Shopify store
                </s-text>
                <s-text>
                  Access more custom features with upgrade
                </s-text>
              </s-stack>
            </s-paragraph>

            <s-button variant="primary" href="/charges?amount=1.99">
              Upgrade Now ($1.99 USD)
            </s-button>
          </s-stack>
        </s-box>
      </s-grid>
    </s-section>
  );
};

export default AppLock;