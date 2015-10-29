package it.eng.spagobi.security.hmacfilter;

import it.eng.spagobi.RestUtilitiesTest;
import it.eng.spagobi.RestUtilitiesTest.HttpMethod;
import it.eng.spagobi.commons.utilities.StringUtilities;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.DispatcherType;

import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.servlet.FilterHolder;
import org.eclipse.jetty.servlet.ServletContextHandler;
import org.eclipse.jetty.servlet.ServletHolder;
import org.junit.AfterClass;
import org.junit.Assert;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

public class HMACFilterTest {

	public final static String key = "ki98";

	private static Server server;

	private final String body = "c=d&j=u";

	@BeforeClass
	public static void setUpClass() throws Exception {
		// Create Server
		startHMACFilterServer();
	}

	@AfterClass
	public static void teatDownClass() throws Exception {
		// Create Server
		stopHMACFilterServer();
	}

	public static void startHMACFilterServer() throws Exception {
		server = new Server(8080);
		ServletContextHandler context = new ServletContextHandler();
		ServletHolder defaultServ = new ServletHolder("default", DummyServlet.class);
		context.addServlet(defaultServ, "/hmac");
		FilterHolder fh = new FilterHolder(HMACFilter.class);
		fh.setInitParameter(HMACFilter.KEY_CONFIG_NAME, key);
		context.addFilter(fh, "/hmac", EnumSet.of(DispatcherType.REQUEST));
		server.setHandler(context);
		server.start();
	}

	@Before
	public void setUp() {
		DummyServlet.arrived = false;
	}

	@Test
	public void testDoFilter() throws IOException, NoSuchAlgorithmException {
		Map<String, String> headers = new HashMap<String, String>();

		// test success get
		String token = "" + System.currentTimeMillis();
		headers.put(HMACFilter.HMAC_TOKEN_HEADER, token);
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, getSignature("/hmac", "a=b", "", token));
		RestUtilitiesTest.makeRequest(HttpMethod.Get, "http://localhost:8080/hmac?a=b", headers, null);
		Assert.assertTrue(DummyServlet.arrived);
		DummyServlet.arrived = false;

		// test success post
		headers.put(HMACFilter.HMAC_TOKEN_HEADER, token);
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, getSignature("/hmac", "", body, token));
		RestUtilitiesTest.makeRequest(HttpMethod.Post, "http://localhost:8080/hmac", headers, body);
		Assert.assertTrue(DummyServlet.arrived);
		DummyServlet.arrived = false;

		// test success post with params in URL
		headers.put(HMACFilter.HMAC_TOKEN_HEADER, token);
		headers.put(RestUtilitiesTest.CONTENT_TYPE, "application/x-www-form-urlencoded");
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, getSignature("/hmac", "g=h&y=i", body, token));
		RestUtilitiesTest.makeRequest(HttpMethod.Post, "http://localhost:8080/hmac?g=h&y=i", headers, body);
		Assert.assertTrue(DummyServlet.arrived);
		DummyServlet.arrived = false;

		// test fail post
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, "i0pe5");
		RestUtilitiesTest.makeRequest(HttpMethod.Post, "http://localhost:8080/hmac?g=h&y=i", headers, body);
		Assert.assertFalse(DummyServlet.arrived);

		// test success put with params in URL
		headers.put(HMACFilter.HMAC_TOKEN_HEADER, token);
		headers.put(RestUtilitiesTest.CONTENT_TYPE, "application/x-www-form-urlencoded");
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, getSignature("/hmac", "g=h&y=i", body, token));
		RestUtilitiesTest.makeRequest(HttpMethod.Put, "http://localhost:8080/hmac?g=h&y=i", headers, body);
		Assert.assertTrue(DummyServlet.arrived);
	}

	@Test
	public void testDoFilterDelete() throws IOException, NoSuchAlgorithmException {
		Map<String, String> headers = new HashMap<String, String>();
		String token = "" + System.currentTimeMillis();
		headers.put(HMACFilter.HMAC_TOKEN_HEADER, token);

		// test success delete with params in URL
		headers.put(RestUtilitiesTest.CONTENT_TYPE, "application/x-www-form-urlencoded");
		// delete: body completely ignored
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, getSignature("/hmac", "g=h&y=i", "", token));
		RestUtilitiesTest.makeRequest(HttpMethod.Delete, "http://localhost:8080/hmac?g=h&y=i", headers, body);
		Assert.assertTrue(DummyServlet.arrived);
	}

	@Test
	public void testDoFilterDeleteFailToken() throws IOException, NoSuchAlgorithmException {
		Map<String, String> headers = new HashMap<String, String>();
		// plus an hour
		String token = "" + (System.currentTimeMillis() + 3600000);
		headers.put(HMACFilter.HMAC_TOKEN_HEADER, token);

		// test success delete with params in URL
		headers.put(RestUtilitiesTest.CONTENT_TYPE, "application/x-www-form-urlencoded");
		// delete: body completely ignored
		headers.put(HMACFilter.HMAC_SIGNATURE_HEADER, getSignature("/hmac", "g=h&y=i", "", token));
		RestUtilitiesTest.makeRequest(HttpMethod.Delete, "http://localhost:8080/hmac?g=h&y=i", headers, body);
		Assert.assertFalse(DummyServlet.arrived);
	}

	private String getSignature(String queryPath, String paramsString, String body, String uniqueToken) throws IOException, NoSuchAlgorithmException {
		StringBuilder res = new StringBuilder(queryPath);
		res.append(paramsString);
		res.append(body);
		res.append(uniqueToken);
		res.append(key);
		String s = res.toString();

		return StringUtilities.sha256(s);
	}

	public static void stopHMACFilterServer() throws Exception {
		server.stop();
	}

}
